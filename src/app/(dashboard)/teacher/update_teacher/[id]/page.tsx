'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// 
import { Button, DatePicker, Form, Input, Select, SelectProps, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';
import { normalizeString } from '@/utils/normalizeString';
import { checkSubjectRelationChange, getChangedFields, isFormChanged } from '@/utils/checkFormChange';
import { formatImageNameFile } from '@/utils/formatImageNameFile';
// types
import { UserInfoType } from '@/types/types';
import { turnToArray } from '@/utils/turnToArray';
import { getSubjectList } from '@/services/subjectServices';
import { getTeacherSubjectRelation } from '@/services/teacherServices';


const UpdateTeacherPage = () => {
   const router = useRouter();
   const { token, isAdmin } = useAuth()

   const { id } = useParams();
   const [form] = Form.useForm();
   const [initialValues, setInitialValues] = useState<UserInfoType>({} as UserInfoType)
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // subject
   const [subjectList, setSubjectList]: any = useState([]);
   const [teacherSubjectRelation, setTeacherSubjectRelation]: any = useState([]);
   const [initialTeacherSubject, setInitialTeacherSubject]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);

   useEffect(() => {
      getTeacherInfo(id);
      if (isAdmin) {
         getSubjectList(token, setSubjectList);
         getTeacherSubjectRelation(token, id, setTeacherSubjectRelation);
      }
   }, [id, form]);
   useEffect(() => {
      const subjectObjID = teacherSubjectRelation?.map((item: any) => item?.id);
      setInitialTeacherSubject(subjectObjID);
      setSubjectSelected(subjectObjID)
   }, [teacherSubjectRelation])
   // 
   const getTeacherInfo = async (teacherID: number | any) => {
      try {
         const res = await axios.get(`${API.USERS}${teacherID}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         const values: UserInfoType = {
            id: data?.id,
            fullname: data?.fullname,
            email: data?.email,
            address: data?.address,
            phone_number: data?.phone_number,
            date_of_birth: data?.date_of_birth
               ? dayjs(data?.date_of_birth, formatDate)
               : null,
            avatar: data?.avatar,
            role: data?.role?.name,
         }
         setInitialValues(values)
         form.setFieldsValue(values);
      } catch (error: any) {
         console.error('Failed to fetch teacher:', error?.response?.detail || error?.message);
      }
   };
   // 
   const updateTeacherSubject = async (teacherID: number, initialSubjectIDs: string[], currentSubjectIDs: string[]) => {
      const initialID = turnToArray(initialSubjectIDs);
      const currentID = turnToArray(currentSubjectIDs);
      const subjectsToRemove = initialID.filter(
         id => !currentID.includes(id)
      );
      const subjectsToAdd = currentID.filter(
         id => !initialID.includes(id)
      );

      if (subjectsToRemove.length === 0 && subjectsToAdd.length === 0) {
         return;
      }
      if (subjectsToRemove.length > 0) {
         for (const subject of subjectsToRemove) {
            try {
               await axios.delete(`${API.TEACHER_SUBJECT}delete-by-param/?teacher_id=${teacherID}&subject_id=${subject}`, {
                  headers: { Authorization: `Bearer ${token}` },
               });
               // console.log(`🗑️ Xóa thành công quan hệ Teacher-Subject_id: \n${teacherID} and ${subject}`);
            } catch (error) {
               console.error(`❌ Lỗi xóa Teacher-Subject_id ${subject}: `, error);
            }
         }
      }
      if (subjectsToAdd.length > 0) {
         const subjectsPayload = subjectsToAdd?.map(subjectID => ({
            teacher_id: teacherID,
            subject_id: subjectID
         }));
         try {
            await axios.post(API.TEACHER_SUBJECT, subjectsPayload,
               {
                  headers: { Authorization: `Bearer ${token}` }
               }
            );
            // console.log(`➕ Thêm thành công Teacher-Subject_id: \n${subjectsPayload}`);
         } catch (error) {
            console.error(`❌ Lỗi thêm Teacher-Subject_id: `, error);
         }
      }
   };

   // 
   const subjectOptions: SelectProps['options'] = subjectList?.map((subject: any) => ({
      label: subject?.name,
      value: subject?.id
   }));
   const handleSubjectSelected = (value: string[]) => {
      setSubjectSelected(value);
   };

   // Pick picture
   const handleUploadChange = (info: any) => {
      const file = info.file.originFileObj
      return file
   };

   // 
   const onFinish = async (values: any) => {
      const isFormChange = isFormChanged(initialValues, values);
      const isSubjectChanged = checkSubjectRelationChange(initialTeacherSubject, subjectSelected);

      if (!isFormChange && !isSubjectChanged) {
         showMessage('info', 'Không có thay đổi nào!');
         return;
      }

      try {
         if (isFormChange) {
            const changedFields = getChangedFields(initialValues, values);
            const formData = new FormData();

            Object.entries(changedFields).forEach(([key, value]) => {
               if (key === 'date_of_birth') {
                  formData.append(key, dayjs(value).format(formatDate));
               } else if (key === 'avatar') {
                  const renamedFile = formatImageNameFile(
                     values.avatar,
                     'Teacher',
                     values.fullname
                  );
                  formData.append('avatar', renamedFile);
               } else {
                  formData.append(key, value);
               }
            });

            // for (const [key, value] of formData.entries()) {
            //    console.log(`💥PUT ${key}:`, value);
            // }
            await axios.put(`${API.USERS}${id}/`, formData,
               {
                  headers:
                     { Authorization: `Bearer ${token}` }
               }
            );
            showMessage('success', 'Cập nhật thông tin giáo viên thành công!');
            router.replace('/teacher');
         }
         if (isSubjectChanged) {
            await updateTeacherSubject(values.id, initialTeacherSubject, subjectSelected);
            showMessage('success', 'Cập nhật thông tin giáo viên thành công!');
            router.replace('/teacher');
         }
      } catch (error) {
         console.error('Update Teacher error:', error);
         showMessage('error', 'Cập nhật thất bại');
      }
   };


   return (
      <div className="form-container">
         <h1 className="form-title">Cập nhật {isAdmin ? `giáo viên` : `thông tin`}</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={initialValues}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID giáo Viên"
               name="id"
            >
               <Input readOnly />
            </Form.Item>
            <Form.Item
               label="Role"
               name="role"
               hidden={true}
            >
            </Form.Item>

            <Form.Item
               label="Tên giáo viên"
               name="fullname"
               rules={[{ required: true, message: 'Vui lòng nhập Tên giáo viên!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Email"
               name="email"
               rules={[{ required: true, type: 'email', message: 'Vui lòng nhập Email!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Địa chỉ"
               name="address"
               rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Số điện thoại"
               name="phone_number"
               rules={[{ required: true, message: 'Vui lòng nhập Số điện thoại!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Ngày sinh"
               name="date_of_birth"
               rules={[{ required: true, type: 'date', message: 'Vui lòng nhập Ngày sinh!' }]}
            >
               <DatePicker format={formatDate} />
            </Form.Item>

            <Form.Item
               label="Môn học"
               hidden={!isAdmin}
            >
               <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Chọn môn"
                  value={subjectSelected}
                  defaultValue={subjectSelected}
                  options={subjectOptions}
                  onChange={handleSubjectSelected}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Form.Item
               label="Ảnh đại diện"
               name="avatar"
               valuePropName="file"
               getValueFromEvent={handleUploadChange}
            >
               <Upload listType="picture-card" maxCount={1} onPreview={() => false}>
                  <button
                     style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }}
                     type="button"
                  >
                     <PlusOutlined />
                     <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                  </button>
               </Upload>
            </Form.Item>

            <Button htmlType="submit" type="primary" loading={loading} className='log-button'>
               <h4>Cập nhật</h4>
            </Button>
         </Form>
      </div>
   );
};

export default UpdateTeacherPage;
