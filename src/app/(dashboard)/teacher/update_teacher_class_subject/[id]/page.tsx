'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// 
import { Button, Form, Input, Select, SelectProps } from 'antd';
import axios from 'axios';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import { normalizeString } from '@/utils/normalizeString';
import { checkRelationChange } from '@/utils/checkFormChange';
// types
import { turnToArray } from '@/utils/turnToArray';
// services
import { getClassList } from '@/services/classServices';
import { getTeacherClassRelation, getTeacherSubjectRelation } from '@/services/teacherServices';


const UpdateTeacherClassSubjectPage = () => {
   const router = useRouter();
   const { token } = useAuth()

   const { id } = useParams();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // subject
   const [teacherSubjectRelation, setTeacherSubjectRelation]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);

   // class
   const [classList, setClassList]: any = useState([]);
   const [teacherClassRelation, setTeacherClassRelation]: any = useState([]);
   const [initialTeacherClass, setInitialTeacherClass]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   const log = () => {
      console.log(
         '\n Teacher ID: ', id,

         '\n\n 💥Teacher-Subject list: ', teacherSubjectRelation,
         '\n Subject selected: ', subjectSelected,
         // // 
         '\n\n Class list: ', classList,
         '\n 💥Teacher-Class-Subject list: ', teacherClassRelation,
         '\n Initial Teacher-Class-Subject: ', initialTeacherClass,
         '\n Teacher-Class-Subject selected: ', classSelected,
      );
   }

   useEffect(() => {
      getTeacherInfo();
      getTeacherSubjectRelation(token, id, setTeacherSubjectRelation);
      getTeacherClassRelation(token, id, subjectSelected, setTeacherClassRelation)
      getClassList(token, setClassList);
   }, [id, form]);
   // 
   useEffect(() => {
      if (teacherSubjectRelation) {
         setSubjectSelected(teacherSubjectRelation[0]?.id);
      }
   }, [teacherSubjectRelation])

   useEffect(() => {
      if (subjectSelected) {
         getTeacherClassRelation(token, id, subjectSelected, setTeacherClassRelation)
      }
   }, [subjectSelected])
   // 
   useEffect(() => {
      if (teacherClassRelation) {
         const classObj = teacherClassRelation?.map((cls: any) => cls?.classes?.id);
         setInitialTeacherClass(classObj)
         setClassSelected(classObj);
      } else {
         setInitialTeacherClass([]);
         setClassSelected([]);
      }
   }, [teacherClassRelation]);
   const getTeacherInfo = async () => {
      setLoading(true);
      try {
         const res = await axios.get(`${API.USERS}${id}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         // console.log('Get teacher info res:', data);
         const values = {
            id: data?.id,
            fullname: data?.fullname,
            email: data?.email,
         }
         form.setFieldsValue(values);
      } catch (error: any) {
         console.error('Failed to fetch teacher:', error?.response?.detail || error?.message);
      } finally {
         setLoading(false);
      }
   };
   // 
   const updateTeacherClassSubjectRelation = async (teacherID: string, initialClassIDs: string[], currentClassIDs: string[]) => {
      const initialID = turnToArray(initialClassIDs);
      const currentID = turnToArray(currentClassIDs);
      const classesToRemove = initialID.filter(
         id => !currentID.includes(id)
      );
      const classesToAdd = currentID.filter(
         id => !initialID.includes(id)
      );

      if (classesToRemove.length === 0 && classesToAdd.length === 0) {
         // console.log('No changes in Teacher-Class-Subject, skip update');
         return;
      }
      if (classesToRemove.length > 0) {
         // console.log('Class to remove: ', classesToRemove)
         for (const classes of classesToRemove) {
            // console.log('ID classes to delete: ', classes)
            try {
               await axios.delete(`${API.TEACHER_CLASS_SUBJECT}delete-by-param/?teacher_id=${teacherID}&class_id=${classes}&subject_id=${subjectSelected}`, {
                  headers: { Authorization: `Bearer ${token}` },
               });
               // console.log(`🗑️ Xóa thành công quan hệ Teacher-Class-Subject: \n${teacherID} and ${classes}`);
            } catch (error) {
               console.error(`❌ Lỗi xóa Teacher-Class-Subject ${classes}: `, error);
            }
         }
      }
      if (classesToAdd.length > 0) {
         // console.log('ID classes to add: ', classesToAdd)
         const classPayload = classesToAdd?.map(classID => ({
            teacher_id: teacherID,
            class_id: classID,
            subject_id: subjectSelected
         }));
         // console.log("Class payload to add: ", classPayload)
         try {
            await axios.post(API.TEACHER_CLASS_SUBJECT, classPayload,
               {
                  headers: { Authorization: `Bearer ${token}` }
               }
            );
            // console.log(`➕ Thêm thành công Teacher-Class-Subject: \n${classPayload}`);
         } catch (error) {
            console.error(`❌ Lỗi thêm Teacher-Class-Subject: `, error);
         }
      }
   };
   // 
   const subjectOptions: SelectProps['options'] = teacherSubjectRelation?.map((subject: any) => ({
      label: subject?.name,
      value: subject?.id
   }));
   const handleSubjectSelected = (value: string[]) => {
      setSubjectSelected(value);
   };
   // 
   const classOptions: SelectProps['options'] = classList?.map((cls: any) => ({
      label: cls.name,
      value: cls.id
   }));
   const handleClassSelected = (value: string[]) => {
      setClassSelected(value);
   };

   // 
   const onFinish = async () => {
      const isClassRelationChanged = checkRelationChange(initialTeacherClass, classSelected);

      if (!isClassRelationChanged) {
         showMessage('info', 'Không có thay đổi nào!');
         return;
      }
      else {
         try {
            await updateTeacherClassSubjectRelation(String(id), initialTeacherClass, classSelected);
            showMessage('success', 'Thêm giáo viên vào lớp thành công!');
            router.replace('/teacher');
         } catch (error) {
            console.error('Update Teacher-Class-Subject error:', error);
            showMessage('error', 'Cập nhật thất bại');
         }
      }
   };


   return (
      <div className="form-container">
         <h1 className="form-title">Thêm giáo viên dạy lớp</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID giáo viên"
               name="id"
            >
               <Input readOnly />
            </Form.Item>

            <Form.Item
               label="Tên giáo viên"
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
               label="Môn học"
            >
               <Select
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
               label="Lớp học"
            >
               <Select
                  mode="multiple"
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
