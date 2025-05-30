'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// 
import { Alert, Button, DatePicker, Form, Input, message, Select, SelectProps, Space, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../teacher.css'
import axios from 'axios';
import { API, API_BASE } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
import { useAppDispatch } from '@/hooks/useDispatch';
// services
import { getApiAction } from '@/services/mainService';
// utils
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';
import { normalizeString } from '@/utils/normalizeString';
import { checkIfChangesExist, getChangedFields, isFormChanged } from '@/utils/checkFormChange';
import { formatImageNameFile } from '@/utils/formatImageNameFile';
// types
import { UserInfoType } from '@/types/types';


const UpdateTeacherPage = () => {
   const router = useRouter();
   const { token } = useAuth()

   const { id } = useParams();
   const [form] = Form.useForm();
   const [initialValues, setInitialValues]: any = useState({})
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // subject
   const [subjectList, setSubjectList]: any = useState([]);
   const [teacherSubjectList, setTeacherSubjectList]: any = useState([]);
   // const [teacherSubjectFiltered, setTeacherSubjectFiltered]: any = useState([]);
   const [subjectFiltered, setSubjectFiltered]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);

   // class
   const [classList, setClassList]: any = useState([]);
   const [teacherClassList, setTeacherClassList]: any = useState([]);
   // const [teacherClassFiltered, setTeacherClassFiltered]: any = useState([]);
   const [classFiltered, setClassFiltered]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   const log = () => {
      console.log(
         // 'Img name: ', imgFileName,
         '\n Subject list: ', subjectList,
         '\n Teacher - Subject list: ', teacherSubjectList,
         // '\n Teacher - Subject filtered: ', teacherSubjectFiltered,
         '\n Subject filtered: ', subjectFiltered,
         '\n Subject selected: ', subjectSelected,
         // // 
         '\n Class list: ', classList,
         '\n Teacher - Class list: ', teacherClassList,
         // '\n Teacher - Class filtered: ', teacherClassFiltered,
         '\n Class filtered: ', classFiltered,
         '\n Class selected: ', classSelected,

         '\n Initial form values: ', initialValues,
         '\n Form values: ', form.getFieldsValue(),
         // '\n Is form changes: ', isFormChanged(initialValues, form.getFieldsValue()),
      );
   }
   useEffect(() => {
      const getTeacherInfo = async (id: number | any) => {
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
               address: data?.address,
               phone_number: data?.phone_number,
               date_of_birth: data?.date_of_birth
                  ? dayjs(data?.date_of_birth, formatDate)
                  : null,
               avatar: data?.avatar
            }
            form.setFieldsValue(values)
            setInitialValues(values)
            console.log('Initial form values: ', initialValues)
            console.log('Form values: ', form.getFieldsValue())
         } catch (error: any) {
            console.error('Failed to fetch teacher:', error?.response?.data || error?.message);
         } finally {
            setLoading(false);
         }
      };
      // 
      const getSubjectList = async () => {
         try {
            const res = await axios.get(API.SUBJECTS, {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            })
            const data = res.data
            console.log('Get subject list res:', data);
            setSubjectList(data);
         } catch (error: any) {
            console.error('Failed to fetch subject list:', error?.response?.data || error?.message);
         }
      };
      // Bang trung gian Teacher - Subject
      const getTeacherSubjectList = async () => {
         try {
            const res = await axios.get(`${API.TEACHER_SUBJECT}?teacher_id=${id}`, {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            })
            const data = res.data
            console.log('Get teacher-subject list res: ', data);
            // const subject = data.map((subj: any) => subj.subject)
            setTeacherSubjectList(data);
         } catch (error: any) {
            console.error('Failed to get teacher-subject list: ', error?.response?.data || error?.message);
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
            console.error('Failed to fetch class list:', error?.response?.data || error?.message);
         }
      };
      // Bang trung gian
      const getTeacherClassList = async () => {
         try {
            const response = await axios.get(`${API.TEACHER_CLASS}?teacher_id=${id}`, {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            })
            const data = response.data
            console.log('Get teacher-class list res: ', data);
            // const classes = data.map((cls: any) => cls.classes)
            setTeacherClassList(data);
         } catch (error: any) {
            console.error('Failed to get teacher-class list: ', error?.response?.data || error?.message);
         }
      };

      getTeacherInfo(id);
      getSubjectList();
      getTeacherSubjectList();
      // 
      getClassList();
      getTeacherClassList();

   }, [id, form]);

   // 
   const updateTeacherSubject = async (teacherID: number, currentRelations: any[], newSubjectIDs: number[]) => {
      const currentSubjects = currentRelations.map(rel => rel.subject);
      const currentSubjectIDs = currentSubjects.map(rel => rel.id);
      // So sánh xem 2 danh sách có giống hệt nhau không
      const isEqual =
         currentSubjectIDs.length === newSubjectIDs.length &&
         currentSubjectIDs.every(id => newSubjectIDs.includes(id));
      if (isEqual) {
         console.log('No changes in teacher-subjects, skip update');
         return;
      }

      if (newSubjectIDs.length < currentSubjectIDs.length) {
         // 🟡 Ít hơn → xóa
         const subjectsToRemove = currentSubjects.filter(
            rel => !newSubjectIDs.includes(rel.id)
         );

         for (const subject of subjectsToRemove) {
            console.log('Id subject to delete: ', subject)
            // try {
            //    await axios.delete(`${API.TEACHER_SUBJECT}delete-by-param/?teacher_id=${id}&subject_id=${subject.id}`, {
            //       headers: { Authorization: `Bearer ${token}` },
            //    });
            //    // message.success('Cập nhật giáo viên thành công!');
            //    router.replace('/teacher')
            //    console.log(`🗑️ Xóa thành công quan hệ subject_name=${subject?.name}`);
            // } catch (error) {
            //    console.error(`❌ Lỗi xóa subject_name=${subject?.name}`, error);
            // }
         }

      } else {
         // 🟢 Nhiều hơn → thêm
         const subjectsToAdd = newSubjectIDs.filter(
            id => !currentSubjectIDs.includes(id)
         );
         // console.log('subjectsToAdd: ', subjectsToAdd)

         const subjectsPayload = subjectsToAdd.map(subjectID => ({
            teacher_id: teacherID,
            subject_id: subjectID
         }));
         console.log("Subject payload: ", subjectsPayload)
         // try {
         //    await axios.post(
         //       API.TEACHER_SUBJECT, subjectsPayload, {
         //       headers: { Authorization: `Bearer ${token}` }
         //    }
         //    );
         //    showMessage('success', 'Cập nhật giáo viên thành công!');
         //    router.replace('/teacher')
         //    console.log(`➕ Thêm thành công Teacher - Subject!`);
         // } catch (error) {
         //    console.error(`❌ Lỗi thêm Teacher - Subject: `, error);
         // }
      }

   };
   // 
   const updateTeacherClass = async (teacherID: number, currentRelations: any[], newClassIDs: number[]) => {
      const currentClasses = currentRelations.map(rel => rel.classes);
      const currentClassIDs = currentClasses.map(rel => rel.id);
      // So sánh xem 2 danh sách có giống hệt nhau không
      const isEqual =
         currentClassIDs.length === newClassIDs.length &&
         currentClassIDs.every(id => newClassIDs.includes(id));
      if (isEqual) {
         console.log('No changes in teacher-class, skip update');
         return;
      }

      if (newClassIDs.length < currentClassIDs.length) {
         // 🟡 Ít hơn → xóa
         const classesToRemove = currentClasses.filter(
            rel => !newClassIDs.includes(rel.id)
         );
         // console.log('classesToRemove: ', classesToRemove)

         for (const classes of classesToRemove) {
            console.log('Id class to delete: ', classes)
            // try {
            //    await axios.delete(`${API.TEACHER_CLASS}delete-by-param/?teacher_id=${id}&teacher_class_id=${classes.id}`, {
            //       headers: { Authorization: `Bearer ${token}` },
            //    });
            //    // showMessage('success', 'Cập nhật giáo viên thành công!');
            //    router.replace('/teacher')
            //    console.log(`🗑️ Xóa thành công quan hệ class_id=${classes?.name}`);
            // } catch (error) {
            //    console.error(`❌ Lỗi xóa class_id=${classes?.name}`, error);
            // }
         }

      } else {
         // 🟢 Nhiều hơn → thêm
         const classesToAdd = newClassIDs.filter(
            id => !currentClassIDs.includes(id)
         );
         // console.log('classesToAdd: ', classesToAdd)
         const classesPayload = classesToAdd.map(classID => ({
            teacher_id: teacherID,
            class_id: classID
         }));
         console.log("Classes payload: ", classesPayload)
         // try {
         //    await axios.post(
         //       API.TEACHER_CLASS, classesPayload,
         //       {
         //          headers: {
         //             Authorization: `Bearer ${token}`
         //          }
         //       }
         //    );
         //    showMessage('success', 'Cập nhật giáo viên thành công!');
         //    router.replace('/teacher')
         //    console.log(`➕ Thêm thành công Teacher - Class!`);
         // } catch (error) {
         //    console.error(`❌ Lỗi thêm Teacher - Class: `, error);
         // }
      }

   };

   // 
   const subjectOptions: SelectProps['options'] = subjectList.map((subject: any) => ({
      label: subject.name,
      value: subject.id
   }));
   const handleSubjectSelected = (value: any) => {
      setSubjectSelected(value);
   };
   // 
   const classOptions: SelectProps['options'] = classList.map((cls: any) => ({
      label: cls.name,
      value: cls.id
   }));
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
   };
   // 
   useEffect(() => {
      if (teacherSubjectList.length > 0) {
         const subjectObj = teacherSubjectList.map((subj: any) => subj?.subject);
         setSubjectFiltered(subjectObj)
         const subject = subjectObj.map((subj: any) => subj?.id);
         setSubjectSelected(subject);
      }
      if (teacherClassList.length > 0) {
         const classObj = teacherClassList.map((cls: any) => cls?.classes);
         setClassFiltered(classObj)
         const classes = classObj.map((cls: any) => cls?.id);
         setClassSelected(classes);
      }
   }, [teacherSubjectList, teacherClassList]);

   // Pick picture
   const handleUploadChange = (info: any) => {
      const file = info.file.originFileObj
      console.log('Img file name: ', file)

      return file
   };

   // 
   const onFinish = async (values: any) => {
      const { isFormChanged, isSubjectChanged, isClassChanged } = checkIfChangesExist(
         initialValues,
         values,
         subjectFiltered,
         subjectSelected,
         classFiltered,
         classSelected
      );

      if (!isFormChanged && !isSubjectChanged && !isClassChanged) {
         showMessage('info', "Không có thay đổi nào!");
         return;
      } if (isFormChanged) {
         // console.log('Initial form: ', initialValues);
         // console.log('Current form: ', values);
         const changedFields = getChangedFields(initialValues, values);
         console.log('Changed fields: ', changedFields);

         if (Object.keys(changedFields).length > 0) {
            const formData = new FormData();

            for (const key in changedFields) {
               if (key === 'date_of_birth') {
                  formData.append(key, dayjs(changedFields[key]).format(formatDate));
               } else {
                  formData.append(key, changedFields[key]);
               }
               // 
               if (key === 'avatar') {
                  const renamedFile = formatImageNameFile(values.avatar, 'Teacher', values.fullname)
                  formData.append('avatar', renamedFile);
               }
            }

            try {
               for (const [key, value] of formData.entries()) {
                  console.log(`💥Patch ${key}:`, value);
               }

               // const res = await axios.patch(`${API.TEACHERS}${id}/`, formData)
               // console.log('Res post: ', res);
               showMessage('success', 'Cập nhật giáo viên thành công!');

               // const resDone = res.data?.id
               // if (resDone && isSubjectChanged) {
               await updateTeacherSubject(values.id, subjectFiltered, subjectSelected);
               //    // console.log('Teach - Subject changed')
               // }
               // if (resDone && isClassChanged) {
               await updateTeacherClass(values.id, classFiltered, classSelected);
               //    // console.log('Teach - Class changed')
               // }
               // router.replace('/teacher')
            } catch (err) {
               console.error('Update error:', err);
               showMessage('error', 'Cập nhật thất bại');
            }
         }
      }
      if (isSubjectChanged) {
         await updateTeacherSubject(values.id, teacherSubjectList, subjectSelected);
      }

      if (isClassChanged) {
         await updateTeacherClass(values.id, teacherClassList, classSelected);
      }

   };

   return (
      <div className="form-container">
         <h1 className="form-title">Cập nhật giáo viên</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID giáo Viên"
               name="id"
            >
               <Input disabled />
            </Form.Item>

            <Form.Item
               label="Tên giáo Viên"
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
               label="Địa chỉ thường trú"
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
               name="subject"
            >
               <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Chọn môn"
                  value={subjectSelected}
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
               name="class"
            >
               <Select
                  mode="multiple"
                  allowClear
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
         <Button onClick={log}>
            <h4>LOG</h4>
         </Button>
      </div>
   );
};

export default UpdateTeacherPage;
