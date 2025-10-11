import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Button,
  Input,
} from '@/components';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  SparklesIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  HeartIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  ArrowRightIcon,
  HomeIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon 
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

/**
 * ContactPage component - Contact information and form
 */
const ContactPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm.');
      reset();
    } catch (error) {
      toast.error('Gửi tin nhắn thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Chúng tôi rất mong được lắng nghe từ bạn. Gửi tin nhắn cho chúng tôi và chúng tôi sẽ phản hồi sớm nhất có thể.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-6">
            <Card>
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Liên Hệ</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPinIcon className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Địa Chỉ</h3>
                      <p className="text-gray-600 mt-1">
                        123ZE321<br />
                        Phú diễn, Nam từ liêm, Hà Nội<br />
                        Việt Nam
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <PhoneIcon className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Số Điện Thoại</h3>
                      <p className="text-gray-600 mt-1">+84 123 456 789</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <EnvelopeIcon className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Email</h3>
                      <p className="text-gray-600 mt-1">info@homestay.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ClockIcon className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Giờ Làm Việc</h3>
                      <div className="text-gray-600 mt-1">
                        <p>Thứ Hai - Thứ Sáu: 8:00 - 22:00</p>
                        <p>Thứ Bảy - Chủ Nhật: 9:00 - 21:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên Hệ Khẩn Cấp</h3>
                <p className="text-gray-600 mb-2">
                  Cho các vấn đề khẩn cấp ngoài giờ làm việc:
                </p>
                <p className="text-primary-600 font-medium">0886528046</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi Tin Nhắn Cho Chúng Tôi</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Họ"
                      {...register('firstName', {
                        required: 'Họ là bắt buộc',
                      })}
                      error={errors.firstName?.message}
                      required
                    />
                    
                    <Input
                      label="Tên"
                      {...register('lastName', {
                        required: 'Tên là bắt buộc',
                      })}
                      error={errors.lastName?.message}
                      required
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    {...register('email', {
                      required: 'Email là bắt buộc',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Địa chỉ email không hợp lệ',
                      },
                    })}
                    error={errors.email?.message}
                    required
                  />

                  <Input
                    label="Số Điện Thoại"
                    type="tel"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />

                  <Input
                    label="Tiêu Đề"
                    {...register('subject', {
                      required: 'Tiêu đề là bắt buộc',
                    })}
                    error={errors.subject?.message}
                    required
                  />

                  <div>
                    <label htmlFor="message" className="form-label">
                      Tin Nhắn *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      className="form-input"
                      placeholder="Cho chúng tôi biết chúng tôi có thể giúp gì cho bạn..."
                      {...register('message', {
                        required: 'Tin nhắn là bắt buộc',
                        minLength: {
                          value: 10,
                          message: 'Tin nhắn phải có ít nhất 10 ký tự',
                        },
                      })}
                    />
                    {errors.message && (
                      <p className="form-error">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    disabled={isLoading}
                    fullWidth
                  >
                    Gửi Tin Nhắn
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
