'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
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
import { getTeacherClassRelation, getTeacherList, getTeacherSubjectRelation } from '@/services/teacherServices';


const CreateAttendanceSession = () => {
   const router = useRouter();
   const { token, isAdmin, isTeacher, info } = useAuth()
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // teacher
   const [teacherList, setTeacherList]: any = useState([]);
   const [teacherSelected, setTeacherSelected]: any = useState([]);
   // subject
   const [teacherSubjectRelation, setTeacherSubjectRelation]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);
   // class
   const [teacherClassRelation, setTeacherClassRelation]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   useEffect(() => {
      if (isAdmin) {
         getTeacherList(token, setTeacherList)
      } else {
         if (info) setTeacherSelected(info?.id);
         getTeacherSubjectRelation(token, teacherSelected, setTeacherSubjectRelation);
         form.setFieldValue('teacher_id', info?.id);
         form.setFieldValue('fullname', info?.fullname);
      }
   }, [])
   useEffect(() => {
      if (teacherSelected) {
         getTeacherSubjectRelation(token, teacherSelected, setTeacherSubjectRelation)
         setSubjectSelected([]);
         setClassSelected([]);
         form.resetFields(['subject_id']);
         form.resetFields(['class_id']);
      }
   }, [teacherSelected])
   useEffect(() => {
      if (subjectSelected) {
         getTeacherClassRelation(token, teacherSelected, subjectSelected, setTeacherClassRelation)
         setClassSelected([]);
         form.resetFields(['class_id']);
      }
   }, [subjectSelected])
   //
   const teacherOptions: SelectProps['options'] = Array.from(teacherList.values()).map((teacher: any) => ({
      label: teacher?.fullname,
      value: teacher?.id
   }));
   const handleTeacherSelected = (value: any) => {
      setTeacherSelected(value);
   };
   //
   const subjectOptions: SelectProps['options'] = Array.from(teacherSubjectRelation.values()).map((subject: any) => ({
      label: subject?.name,
      value: subject?.id
   }));
   const handleSubjectSelected = (value: any) => {
      setSubjectSelected(value);
   };
   // 
   const uniqueClassMap = new Map<string, any>();
   teacherClassRelation.forEach((cls: any) => {
      const className = cls?.classes?.name;
      if (!uniqueClassMap.has(className)) {
         uniqueClassMap.set(className, cls);
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
         // console.log('Post Session res:', res);
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
            {!isAdmin && <Form.Item
               label="Tên giáo viên"
               name="fullname"
            >
               <Input readOnly={!isAdmin} />
            </Form.Item>}

            {isAdmin && <Form.Item
               label="Giáo viên"
               name="teacher_id"
               rules={[{ required: true, message: 'Vui lòng chọn Giáo viên!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn giáo viên"
                  value={teacherSelected}
                  onChange={handleTeacherSelected}
                  options={teacherOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>}
            <Form.Item
               label="Môn học"
               name="subject_id"
               rules={[{ required: true, message: 'Vui lòng chọn Môn!' }]}
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
               rules={[{ required: true, message: 'Vui lòng chọn Lớp học!' }]}
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
               <h4>Tạo</h4>
            </Button>
         </Form>
      </div>
   );
};

export default CreateAttendanceSession;
