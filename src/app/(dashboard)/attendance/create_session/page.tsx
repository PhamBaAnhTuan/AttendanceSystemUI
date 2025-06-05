'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
// import '../schedule.css';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, Select, SelectProps, DatePicker, Checkbox } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import { normalizeString, removeSpace } from '@/utils/normalizeString';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';


const CreateAttendanceSession = () => {
   const router = useRouter();
   const { token, isAdmin, isTeacher, info } = useAuth()
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // teacher
   const [teacherSubjectRelation, setTeacherSubjectRelation]: any = useState([]);
   const [teacherSelected, setTeacherSelected]: any = useState([]);
   // subject
   const [teacherClassSubjectList, setTeacherClassSubjectList]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);
   // class
   const [classSelected, setClassSelected]: any = useState([]);

   const log = () => {
      console.log(
         '🔥 Is Admin: ', isAdmin,
         '\n🔥 Info: ', info,

         '\n Teacher selected: ', teacherSelected,
         '\n\n Teacher-Class-Subject list: ', teacherClassSubjectList,

         '\n Class option: ', classOptions,
         '\n Class selected: ', classSelected,
         '\n Subject option: ', subjectOptions,
         '\n Subject selected: ', subjectSelected,
      );
   }

   useEffect(() => {
      getTeacherSubjectRelation(info?.id);
      setTeacherSelected(info?.id);
      getTeacherClassSubjectList(info?.id, subjectSelected);
      form.setFieldValue('teacher_id', info?.id);
      form.setFieldValue('fullname', info?.fullname);
   }, [])
   useEffect(() => {
      if (subjectSelected.length > 0) {
         getTeacherClassSubjectList(info?.id, subjectSelected)
         setClassSelected([]);
         form.resetFields(['class_id']);
      }
   }, [subjectSelected])

   // 
   const getTeacherSubjectRelation = async (teacherID: string | undefined) => {
      try {
         const res = await axios.get(`${API.TEACHER_SUBJECT}?teacher_id=${teacherID}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Teacher-Subject list res:', data);
         setTeacherSubjectRelation(data);
      } catch (error: any) {
         console.error('Failed to fetch Teacher-Subject list:', error?.response?.detail || error?.message);
      }
   }
   // 
   const getTeacherClassSubjectList = async (teacherID: string | undefined, subjectID: string | undefined) => {
      try {
         const res = await axios.get(`${API.TEACHER_CLASS_SUBJECT}?teacher_id=${teacherID}&subject_id=${subjectID}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Teacher-Class-Subject list res:', data);
         setTeacherClassSubjectList(data);
      } catch (error: any) {
         console.error('Failed to fetch Teacher-Class-Subject list:', error?.response?.detail || error?.message);
      }
   }

   // 
   // const uniqueSubjectMap = new Map<string, any>();
   // teacherClassSubjectList.forEach((subject: any) => {
   //    const subjectName = subject?.subject?.name;
   //    if (!uniqueSubjectMap.has(subjectName)) {
   //       uniqueSubjectMap.set(subjectName, subject);
   //       // console.log('Unique subject added:', uniqueSubjectMap);
   //    }
   // });
   const subjectOptions: SelectProps['options'] = Array.from(teacherSubjectRelation.values()).map((subject: any) => ({
      label: subject?.subject?.name,
      value: subject?.subject?.id
   }));
   const handleSubjectSelected = (value: any) => {
      setSubjectSelected(value);
   };
   // 
   const uniqueClassMap = new Map<string, any>();
   teacherClassSubjectList.forEach((cls: any) => {
      const className = cls?.classes?.name;
      if (!uniqueClassMap.has(className)) {
         uniqueClassMap.set(className, cls);
         // console.log('Unique class added:', uniqueClassMap);
      }
   });
   const classOptions: SelectProps['options'] = Array.from(uniqueClassMap.values()).map((cls: any) => ({
      label: cls?.classes?.name,
      value: cls?.classes?.id
   }));
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
   };

   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {

      setLoading(true);
      try {
         const teacherName = removeSpace(info?.fullname || '')
         const subjectName = removeSpace(subjectOptions.find(subj => subj.value === subjectSelected)?.label || '')
         const className = classOptions.find(cls => cls.value === classSelected)?.label || '';

         const nameSession = teacherName + '_' + subjectName + '_' + className

         const formData = new FormData();
         formData.append('teacher_id', teacherSelected);
         formData.append('class_id', classSelected);
         formData.append('subject_id', subjectSelected);
         formData.append('session_name', nameSession);
         // console.log('form: ', form)
         const res = await axios.post(`${API.ATTENDANCE}`, formData, {
            headers: {
               'Authorization': `Bearer ${token}`,
            },
         });
         console.log('Post Session res:', res);
         const sessionID = res.data.id;
         const sessionName = res.data.session_name;
         const time = res.data.start_time;
         showMessage('loading', 'Tạo phiên điểm danh thành công!\n Chuyển hướng đến trang điểm danh...');
         router.push(`/attendance?sessionID=${sessionID}&sessionName=${sessionName}&time=${time}`);
      } catch (error: any) {
         console.error('Lỗi chi tiết từ server:', error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Tạo phiên điểm danh</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >
            {isTeacher && <Form.Item
               label="Tên giáo viên"
               name="fullname"
            >
               <Input disabled />
            </Form.Item>}

            <Form.Item
               label="Môn học"
               name="subject_id"
               rules={[{ required: true, message: 'Vui lòng nhập Môn học!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn môn"
                  value={subjectSelected}
                  onChange={handleSubjectSelected}
                  options={subjectOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Form.Item
               label="Lớp học"
               name="class_id"
               rules={[{ required: true, message: 'Vui lòng nhập Lớp học!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn lớp"
                  value={classSelected}
                  onChange={handleClassSelected}
                  options={classOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Button type="primary" htmlType="submit"
               loading={loading}
               className='log-button'
            >
               <h4>Thêm</h4>
            </Button>
         </Form>
         <Button onClick={log}>
            <h4>LOG</h4>
         </Button>
      </div>
   );
};

export default CreateAttendanceSession;
