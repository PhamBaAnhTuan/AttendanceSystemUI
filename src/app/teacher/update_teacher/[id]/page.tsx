'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// 
import { Alert, Button, Form, Input, message, Select, SelectProps, Space, Upload } from 'antd';
import '../../student.css'
import axios from 'axios';
import { API, API_BASE } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useSubject } from '@/hooks/useData';
import { useAppDispatch } from '@/hooks/useDispatch';
// services
import { getApiAction } from '@/services/mainService';

const TEACHER_API = API.TEACHERS
const SUBJECT_API = API.SUBJECTS
const TEACHER_SUBJECT_API = API.TEACHER_SUBJECT

const UpdateTeacherPage = () => {
   const dispatch = useAppDispatch()
   const { token } = useAuth()
   // const { subjectList } = useSubject()

   const { id } = useParams();
   const router = useRouter();
   const [messageApi, contextHolder] = message.useMessage();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);

   const [subjectList, setSubjectList]: any = useState([]);
   const [teacherSubjectFiltered, setTeacherSubjectFiltered]: any = useState([]);
   const [subjectFiltered, setSubjectFiltered]: any = useState([]);
   const [teacherSubjectList, setTeacherSubjectList]: any = useState([]);

   const log = () => {
      console.log(
         'Img name: ', imgFileName,
         '\n Subject list: ', subjectList,
         '\n Teacher - Subject list: ', teacherSubjectList,
         '\n Teacher - Subject filtered: ', teacherSubjectFiltered,
         '\n Subject filtered: ', subjectFiltered,
      );
   }

   // Pick picture
   const [imgFileName, setImgFileName] = useState<string | null>(null);
   const handleUploadChange = (info: any) => {
      const fileObj = info.fileList[info.fileList.length - 1]?.originFileObj;
      // console.log("Pick img file: ", fileObj);
      if (fileObj) {
         setImgFileName(fileObj.name);
         form.setFieldsValue({ avatar: fileObj });
      } else {
         setImgFileName(null);
         form.setFieldsValue({ avatar: undefined });
      }
      console.log("Pick img file: ", fileObj);
   };

   useEffect(() => {
      const getTeacherInfo = async (id: number | any) => {
         setLoading(true);
         try {
            const res = await axios.get(`${TEACHER_API}${id}/`)
            const response = res.data
            console.log('Get teacher info res:', response);
            // messageApi.success('Lấy thông tin giáo viên thành công!');
            form.setFieldsValue({
               id: response?.id,
               name: response?.name,
               class_id: response?.class_id,
               email: response?.email,
               address: response?.address,
               phone_number: response?.phone_number,
            });
            if (response?.avatar) {
               const parts = response.avatar.split('/');
               const filename = parts[parts.length - 1];
               setImgFileName(filename);
            }
         } catch (error: any) {
            console.error('Failed to fetch teacher:', error?.response?.data || error?.message);
            // messageApi.error('Lấy thông tin giáo viên thất bại!');
         } finally {
            setLoading(false);
         }
      };
      // 
      const getSubjectList = async () => {
         setLoading(true);
         try {
            const response = await axios.get(`${SUBJECT_API}`)
            const data = response.data
            console.log('Get subject list res:', data);
            setSubjectList(data);
         } catch (error: any) {
            console.error('Failed to fetch subject list:', error?.response?.data || error?.message);
         } finally {
            setLoading(false);
         }
      };
      // Bang trung gian
      const getTeacherSubjectList = async () => {
         setLoading(true);
         try {
            const response = await axios.get(`${TEACHER_SUBJECT_API}`)
            const data = response.data
            console.log('Get teacher-subject list res: ', data);
            setTeacherSubjectList(data);
            // messageApi.success('Lấy thông tin giáo viên - môn học thành công!');
         } catch (error: any) {
            console.error('Failed to get teacher-subject list: ', error?.response?.data || error?.message);
            // messageApi.error('Lấy thông tin giáo viên - môn học thất bại!');
         } finally {
            setLoading(false);
         }
      };

      getTeacherInfo(id);
      getSubjectList();
      getTeacherSubjectList();
      // 

   }, [id, form]);

   useEffect(() => {
      if (teacherSubjectList) {
         const filtered = teacherSubjectList.filter((teaSub: any) => teaSub.teacher_id == id)
         setTeacherSubjectFiltered(filtered)
         const subjectFiltered = filtered.map((fil: any) => fil.subject_id)
         setSubjectFiltered(subjectFiltered)
         if (teacherSubjectFiltered.length = 0) {
            console.log('teacher-subject filtered: ', teacherSubjectFiltered)
         } else {
            console.log('teacher-subject filtered empty!')
         }
      }
      else {
         console.log('Teacher - Subject list is empty!')
      }
   }, [teacherSubjectList])

   // useEffect(() => {
   //    if (teacherSubjectFiltered) {
   //       const filtered = teacherSubjectFiltered.filter((teaSub: any) => teaSub.teacher_id == id)
   //       setTeacherSubjectFiltered(filtered)
   //       const subjectFiltered = filtered.map((fil: any) => fil.subject_id)
   //       setSubjectFiltered(subjectFiltered)
   //       if (teacherSubjectFiltered.length = 0) {
   //          console.log('teacher-subject filtered: ', teacherSubjectFiltered)
   //       } else {
   //          console.log('teacher-subject filtered empty!')
   //       }
   //    }
   //    else {
   //       console.log('Teacher - Subject list is empty!')
   //    }
   // }, [teacherSubjectFiltered])



   const onFinish = async (values: any) => {
      console.log('Form values:', values);
      setLoading(true);

      const formData = new FormData();
      const fields = ['id', 'name', 'email', 'address', 'phone_number'];
      fields.forEach(field => {
         if (values[field]) {
            formData.append(field, values[field]);
         }
      });

      // Kiểm tra avatar là File
      if (values.avatar instanceof File) {
         formData.append('avatar', values.avatar);
         console.log('Avatar file:', values.avatar);
      } else {
         console.warn('Avatar is not a valid file:', values.avatar);
      }

      try {
         const response = await axios.patch(`${URL}${values.id}/`, formData, {
            headers: {
               'Authorization': `Bearer ${token}`,
            },
         });
         console.log('Response:', response.data);
         messageApi.success('Cập nhật giáo viên thành công!');
         router.replace('/teacher');
      } catch (error: any) {
         console.error('Lỗi chi tiết từ server:', error.response?.data);
      } finally {
         setLoading(false);
      }
   };

   // 
   const options: SelectProps['options'] = teacherSubjectList.map((subject: any) => ({
      label: subject.name,
      value: subject.id
   }));

   const handleSelectClass = (value: string[]) => {
      console.log(`selected ${value}`);
   };

   return (
      <div className="form-container">
         {contextHolder}
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
               rules={[{ required: true, message: 'Vui lòng nhập ID giáo viên!' }]}
            >
               <Input disabled />
            </Form.Item>

            <Form.Item
               label="Tên giáo Viên"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập tên giáo viên!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Email"
               name="email"
               rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Địa chỉ thường trú"
               name="address"
               rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Số điện thoại"
               name="phone_number"
               rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
               <Input />
            </Form.Item>
            <Form.Item
               label="Lớp học"
               name="class"
               rules={[{ required: true, message: 'Vui lòng chọn lớp!' }]}
            >
               <Space style={{ width: '100%' }} direction="vertical">
                  <Select
                     mode="multiple"
                     allowClear
                     style={{ width: '100%' }}
                     placeholder="Please select"
                     defaultValue={subjectFiltered.map(sub => sub.name)}
                     onChange={handleSelectClass}
                     options={options}
                  />
               </Space>
            </Form.Item>

            <Form.Item
               label="Ảnh đại diện"
               name="avatar"
               valuePropName="file"
            >
               <Upload
                  name="avatar"
                  listType="picture"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleUploadChange}
               >
                  <Button >Chọn ảnh</Button>
               </Upload>
               {imgFileName && <Alert message={`Đã chọn: ${imgFileName}`} type="success" showIcon style={{ marginTop: '10px' }} />}
            </Form.Item>

            <Button htmlType="submit" type="primary" loading={loading} className='log-button'>
               Cập nhật
            </Button>
         </Form>
         <Button style={{ width: '100%' }} onClick={log}>
            LOG
         </Button>
      </div>
   );
};

export default UpdateTeacherPage;
