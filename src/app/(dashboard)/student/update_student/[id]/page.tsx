'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
// 
import { Button, DatePicker, Form, Input, Select, SelectProps, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
import { checkRelationChange, getChangedFields, isFormChanged } from '@/utils/checkFormChange';
import { formatImageNameFile } from '@/utils/formatImageNameFile';
import { turnToArray } from '@/utils/turnToArray';
// types
import { UserInfoType } from '@/types/types';
// services
import { getClassList } from '@/services/classServices';
import { getStudentClassRelationByStudentID } from '@/services/studentServices';


const UpdateStudentPage = () => {
   const router = useRouter();
   const { token, isAdmin } = useAuth()

   const { id } = useParams();
   const [form] = Form.useForm();
   const [initialValues, setInitialValues] = useState<UserInfoType>({} as UserInfoType)
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // class
   const [classList, setClassList]: any = useState([]);
   const [initialStudentClass, setInitialStudentClass]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   useEffect(() => {
      getStudentInfo();
      if (isAdmin) {
         getClassList(token, setClassList);
         getStudentClassRelationByStudentID(token, id, setInitialStudentClass, setClassSelected)
      }
   }, [id, form]);

   const getStudentInfo = async () => {
      setLoading(true);
      try {
         const res = await axios.get(`${API.USERS}${id}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         // console.log('Get Student info res:', data);
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
         console.error('Failed to fetch Student:', error?.response?.data || error?.message);
      } finally {
         setLoading(false);
      }
   };
   // Pick picture
   const handleUploadChange = (info: any) => {
      const file = info.file.originFileObj
      // console.log('Img file name: ', file)

      return file
   };
   // 
   const classOptions: SelectProps['options'] = classList?.map((cls: any) => ({
      label: cls.name,
      value: cls.id
   }));
   const handleClassSelected = (value: string[]) => {
      setClassSelected(value);
   };

   const updateStudentClass = async (studentID: string, initialClassIDs: string[], currentClassIDs: string[]) => {
      const initialID = turnToArray(initialClassIDs);
      const currentID = turnToArray(currentClassIDs);
      const classesToRemove = initialID.filter(
         id => !currentID.includes(id)
      );
      const classesToAdd = currentID.filter(
         id => !initialID.includes(id)
      );

      if (classesToRemove.length === 0 && classesToAdd.length === 0) {
         return;
      }
      if (classesToRemove.length > 0) {
         try {
            await axios.delete(`${API.STUDENT_CLASS}delete-by-param/?student_id=${studentID}&class_id=${classesToRemove}`, {
               headers: { Authorization: `Bearer ${token}` },
            });
            // console.log(`🗑️ Xóa thành công quan hệ Student-Class: \n${studentID} and ${classesToRemove}`);
         } catch (error) {
            console.error(`❌ Lỗi xóa Student-Class ${classesToRemove}: `, error);
         }
      }
      if (classesToAdd.length > 0) {
         const classPayload = classesToAdd?.map(classID => ({
            student_id: studentID,
            class_id: classID
         }));
         try {
            await axios.post(API.STUDENT_CLASS, classPayload,
               {
                  headers: { Authorization: `Bearer ${token}` }
               }
            );
            // console.log(`➕ Thêm thành công Student-Class: \n${classPayload}`);
         } catch (error) {
            console.error(`❌ Lỗi thêm Student-Class: `, error);
         }
      }
   };

   // 
   const onFinish = async (values: any) => {
      const isFormChange = isFormChanged(initialValues, values);
      const isRelationChange = checkRelationChange(initialStudentClass, classSelected);

      if (!isFormChange && !isRelationChange) {
         showMessage('info', 'Không có thay đổi nào!');
         return;
      }

      try {
         if (isFormChange) {
            setLoading(true)
            const changedFields = getChangedFields(initialValues, values);
            const formData = new FormData();

            Object.entries(changedFields).forEach(([key, value]) => {
               if (key === 'date_of_birth') {
                  formData.append(key, dayjs(value).format(formatDate));
               } else if (key === 'avatar') {
                  const renamedFile = formatImageNameFile(
                     values.avatar,
                     'Student',
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
            showMessage('success', 'Cập nhật thông tin sinh viên thành công!');
            router.replace('/student');
         }
         if (isRelationChange) {
            setLoading(true)
            await updateStudentClass(values.id, initialStudentClass, classSelected);
            showMessage('success', 'Cập nhật thông tin sinh viên thành công!');
            router.replace('/student');
         }
      } catch (error) {
         console.error('Update error:', error);
         showMessage('error', 'Cập nhật thất bại');
      } finally {
         setLoading(false);
      }
   };


   return (
      <div className="form-container">
         <h1 className="form-title">{isAdmin ? 'Cập nhật' : 'Thông tin'} sinh viên</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={initialValues}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID sinh viên"
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
               label="Tên sinh viên"
               name="fullname"
               rules={[{ required: true, message: 'Vui lòng nhập Tên sinh viên!' }]}
            >
               <Input allowClear readOnly={!isAdmin} />
            </Form.Item>

            <Form.Item
               label="Email"
               name="email"
               rules={[{ required: true, type: 'email', message: 'Vui lòng nhập Email!' }]}
            >
               <Input allowClear readOnly={!isAdmin} />
            </Form.Item>

            <Form.Item
               label="Địa chỉ"
               name="address"
               rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ!' }]}
            >
               <Input allowClear readOnly={!isAdmin} />
            </Form.Item>

            <Form.Item
               label="Số điện thoại"
               name="phone_number"
               rules={[{ required: true, message: 'Vui lòng nhập Số điện thoại!' }]}
            >
               <Input allowClear readOnly={!isAdmin} />
            </Form.Item>

            <Form.Item
               label="Ngày sinh"
               name="date_of_birth"
               rules={[{ required: true, type: 'date', message: 'Vui lòng nhập Ngày sinh!' }]}
            >
               <DatePicker format={formatDate} readOnly={!isAdmin} />
            </Form.Item>

            <Form.Item
               label="Lớp học"
               hidden={!isAdmin}
            >
               <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn lớp"
                  value={classSelected}
                  defaultValue={classSelected}
                  options={classOptions}
                  onChange={handleClassSelected}
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
               hidden={!isAdmin}
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

            {isAdmin && <Button htmlType="submit" type="primary" loading={loading} className='log-button'>
               <h4>Cập nhật</h4>
            </Button>}
         </Form>
      </div>
   );
};

export default UpdateStudentPage;
