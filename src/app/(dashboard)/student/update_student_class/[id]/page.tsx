'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
// 
import { Button, Form, Input, Select, SelectProps } from 'antd';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import { normalizeString } from '@/utils/normalizeString';
import { checkClassRelationChange } from '@/utils/checkFormChange';
// types
import { UserInfoType } from '@/types/types';
import { turnToArray } from '@/utils/turnToArray';
// services
import { getStudentClassRelation, getStudentClassRelationByStudentID } from '@/services/studentServices';
import { getClassList } from '@/services/classServices';


const UpdateTeacherClassSubjectPage = () => {
   const router = useRouter();
   const { token } = useAuth()

   const { id } = useParams();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // class
   const [classList, setClassList]: any = useState([]);
   const [initialStudentClass, setInitialStudentClass]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   useEffect(() => {
      getStudentInfo();
      getStudentClassRelationByStudentID(token, id, setInitialStudentClass, setClassSelected);
      getClassList(token, setClassList);
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
         // console.log('Get student info res:', data);
         const values = {
            id: data?.id,
            fullname: data?.fullname,
            email: data?.email,
         }
         form.setFieldsValue(values);
      } catch (error: any) {
         console.error('Failed to fetch Student:', error?.response?.detail || error?.message);
      } finally {
         setLoading(false);
      }
   };
   //
   const updateStudentClassRelation = async (studentID: string, initialClassIDs: string[], currentClassIDs: string[]) => {
      const initialID = turnToArray(initialClassIDs)
      const currentID = turnToArray(currentClassIDs)
      const classesToRemove = initialID.filter(
         id => !currentID.includes(id)
      );
      const classesToAdd = currentID.filter(
         id => !initialID.includes(id)
      );

      if (classesToRemove.length === 0 && classesToAdd.length === 0) {
         // console.log('No changes in Student-Class, skip update');
         return;
      }
      if (classesToRemove.length > 0) {
         // console.log('Class to remove: ', classesToRemove)
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
         // console.log('ID classes to add: ', classesToAdd)
         const classPayload = classesToAdd.map(classID => ({
            student_id: studentID,
            class_id: classID,
         }));
         // console.log("Class payload to add: ", classPayload)
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
   const classOptions: SelectProps['options'] = classList.map((cls: any) => ({
      label: cls.name,
      value: cls.id
   }));
   const handleClassSelected = (value: string[]) => {
      setClassSelected(value);
   };

   // 
   const onFinish = async () => {
      const isClassRelationChanged = checkClassRelationChange(initialStudentClass, classSelected);

      if (!isClassRelationChanged) {
         showMessage('info', 'Không có thay đổi nào!');
         return;
      }
      else {
         try {
            await updateStudentClassRelation(String(id), initialStudentClass, classSelected);
            showMessage('success', 'Thêm sinh viên vào lớp thành công!');
            router.replace('/student');
         } catch (error) {
            console.error('Update Class relation error:', error);
            showMessage('error', 'Cập nhật thất bại');
         }
      }
   };


   return (
      <div className="form-container">
         <h1 className="form-title">Thêm sinh viên vào lớp</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID sinh viên"
               name="id"
            >
               <Input readOnly />
            </Form.Item>

            <Form.Item
               label="Tên sinh viên"
               name="fullname"
            >
               <Input readOnly />
            </Form.Item>

            <Form.Item
               label="Email"
               name="email"
            >
               <Input readOnly />
            </Form.Item>

            <Form.Item
               label="Lớp học"
            >
               <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn lớp"
                  value={classSelected}
                  options={classOptions}
                  onChange={handleClassSelected}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Button htmlType="submit" type="primary" loading={loading} className='log-button'>
               <h4>Cập nhật</h4>
            </Button>
         </Form>
      </div>
   );
};

export default UpdateTeacherClassSubjectPage;
