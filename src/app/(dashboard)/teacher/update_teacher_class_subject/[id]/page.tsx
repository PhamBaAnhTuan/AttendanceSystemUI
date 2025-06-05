'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// 
import { Button, Form, Input, Select, SelectProps } from 'antd';
import '../../teacher.css'
import axios from 'axios';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import { normalizeString } from '@/utils/normalizeString';
import { checkRelationChange } from '@/utils/checkFormChange';
// types
import { UserInfoType } from '@/types/types';
import { turnToArray } from '@/utils/turnToArray';


const UpdateTeacherClassSubjectPage = () => {
   const router = useRouter();
   const { token } = useAuth()

   const { id } = useParams();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // subject
   const [teacherSubjectList, setTeacherSubjectList]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);

   // class
   const [classList, setClassList]: any = useState([]);
   const [teacherClassSubjectList, setTeacherClassSubjectList]: any = useState([]);
   const [initialTeacherClassSubject, setInitialTeacherClassSubject]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   const log = () => {
      console.log(
         '\n Teacher ID: ', id,

         '\n\n 💥Teacher-Subject list: ', teacherSubjectList,
         '\n Subject selected: ', subjectSelected,
         // // 
         '\n\n Class list: ', classList,
         '\n 💥Teacher-Class-Subject list: ', teacherClassSubjectList,
         '\n Initial Teacher-Class-Subject: ', initialTeacherClassSubject,
         '\n Teacher-Class-Subject selected: ', classSelected,
      );
   }

   useEffect(() => {
      const getTeacherInfo = async () => {
         setLoading(true);
         try {
            const res = await axios.get(`${API.USERS}${id}`, {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            })
            const data = res.data
            console.log('Get teacher info res:', data);
            const values = {
               id: data?.id,
               fullname: data?.fullname,
               email: data?.email,
            }
            form.setFieldsValue(values);
            console.log('Form values: ', form.getFieldsValue())
         } catch (error: any) {
            console.error('Failed to fetch teacher:', error?.response?.detail || error?.message);
         } finally {
            setLoading(false);
         }
      };

      // 
      const getTeacherSubjectList = async () => {
         try {
            const res = await axios.get(`${API.TEACHER_SUBJECT}?teacher_id=${id}`, {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            })
            const data = res.data
            console.log('Get teacher-subject list res: ', data);
            const subject = data.map((subj: any) => subj?.subject?.id)
            setTeacherSubjectList(data);
            setSubjectSelected(subject[0]);
         } catch (error: any) {
            console.error('Failed to get teacher-subject list: ', error?.response?.detail || error?.message);
         }
      };
      // 
      const getClassList = async () => {
         try {
            const res = await axios.get(API.CLASSES, {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            })
            const data = res.data
            console.log('Get class list res:', data);
            setClassList(data);
         } catch (error: any) {
            console.error('Failed to fetch class list:', error?.response?.detail || error?.message);
         }
      };


      getTeacherInfo();
      getTeacherSubjectList();
      getClassList();
   }, [id, form]);

   // 
   const getTeacherClassSubjectList = async (subjectID: string) => {
      try {
         const response = await axios.get(`${API.TEACHER_CLASS_SUBJECT}?teacher_id=${id}&subject_id=${subjectID}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = response.data
         console.log('Get teacher-class list res: ', data);
         const classes = data.map((cls: any) => cls?.classes)
         setTeacherClassSubjectList(classes);
      } catch (error: any) {
         console.error('Failed to get teacher-class list: ', error?.response?.data || error?.message);
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
         console.log('No changes in Teacher-Class-Subject, skip update');
         return;
      }
      if (classesToRemove.length > 0) {
         console.log('Class to remove: ', classesToRemove)
         for (const classes of classesToRemove) {
            console.log('ID classes to delete: ', classes)
            try {
               await axios.delete(`${API.TEACHER_CLASS_SUBJECT}delete-by-param/?teacher_id=${teacherID}&class_id=${classes}&subject_id=${subjectSelected}`, {
                  headers: { Authorization: `Bearer ${token}` },
               });
               console.log(`🗑️ Xóa thành công quan hệ Teacher-Class-Subject: \n${teacherID} and ${classes}`);
            } catch (error) {
               console.error(`❌ Lỗi xóa Teacher-Class-Subject ${classes}: `, error);
            }
         }
      }
      if (classesToAdd.length > 0) {
         console.log('ID classes to add: ', classesToAdd)
         const classPayload = classesToAdd.map(classID => ({
            teacher_id: teacherID,
            class_id: classID,
            subject_id: subjectSelected
         }));
         console.log("Class payload to add: ", classPayload)
         try {
            await axios.post(API.TEACHER_CLASS_SUBJECT, classPayload,
               {
                  headers: { Authorization: `Bearer ${token}` }
               }
            );
            console.log(`➕ Thêm thành công Teacher-Class-Subject: \n${classPayload}`);
         } catch (error) {
            console.error(`❌ Lỗi thêm Teacher-Class-Subject: `, error);
         }
      }
   };
   // 
   const subjectOptions: SelectProps['options'] = teacherSubjectList.map((subject: any) => ({
      label: subject.subject?.name,
      value: subject.subject?.id
   }));
   const handleSubjectSelected = (value: string[]) => {
      setSubjectSelected(value);
   };
   // 
   const classOptions: SelectProps['options'] = classList.map((cls: any) => ({
      label: cls.name,
      value: cls.id
   }));
   const handleClassSelected = (value: string[]) => {
      setClassSelected(value);
   };

   useEffect(() => {
      getTeacherClassSubjectList(subjectSelected);
   }, [subjectSelected])
   // 
   useEffect(() => {
      if (teacherClassSubjectList.length > 0) {
         const classObj = teacherClassSubjectList.map((cls: any) => cls?.id);
         setInitialTeacherClassSubject(classObj)
         setClassSelected(classObj);
      } else {
         setInitialTeacherClassSubject([]);
         setClassSelected([]);
      }
   }, [teacherClassSubjectList]);

   // 
   const onFinish = async () => {
      const isClassRelationChanged = checkRelationChange(initialTeacherClassSubject, classSelected);

      if (!isClassRelationChanged) {
         showMessage('info', 'Không có thay đổi nào!');
         return;
      }
      else {
         try {
            await updateTeacherClassSubjectRelation(String(id), initialTeacherClassSubject, classSelected);
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
               <Input disabled />
            </Form.Item>

            <Form.Item
               label="Tên giáo viên"
               name="fullname"
            >
               <Input disabled />
            </Form.Item>

            <Form.Item
               label="Email"
               name="email"
            >
               <Input disabled />
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
