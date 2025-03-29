import React, { useState, useEffect } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/DataTable';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

interface APIMember {
  id: string;
  user_id: string | null;
  name: string;
  gender: string;
  email: string;
  contact: string;
  date_of_birth: string;
  blood_group: string;
  location: string;
  address: string;
  occupation: string;
  membership_start_date: string;
  membership_end_date: string;
  status: string;
  image_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberForm {
  registrationDate: string;
  name: string;
  contact: string;
  alternateNo: string;
  sameAsContact: boolean;
  gender: string;
  email: string;
  address: string;
  emergencyContact: string;
  dateOfBirth: string;
  bloodGroup: string;
  occupation: string;
  gstNumber: string;
  image: string;
  enquiryExecutive: string;
  memberExecutive: string;
  location: string;
  membershipStartDate: string;
  membershipEndDate: string;
}

interface FormErrors {
  [key: string]: string;
}

const MemberRegistration = () => {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState<APIMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MemberForm>({
    registrationDate: new Date().toISOString().split('T')[0],
    name: '',
    contact: '',
    alternateNo: '',
    sameAsContact: false,
    gender: '',
    email: '',
    address: '',
    emergencyContact: '',
    dateOfBirth: '',
    bloodGroup: '',
    occupation: '',
    gstNumber: '',
    image: '',
    enquiryExecutive: '',
    memberExecutive: '',
    location: '',
    membershipStartDate: new Date().toISOString().split('T')[0],
    membershipEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  const [previewImage, setPreviewImage] = useState('');

  const fetchMembers = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('http://localhost:3000/api/members', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to fetch members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [location.pathname]);

  const columns: ColumnDef<APIMember>[] = [
    {
      accessorKey: 'created_at',
      header: 'Registration Date',
      cell: ({ row }) => format(new Date(row.original.created_at), 'dd/MM/yyyy'),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.gender}</span>
      ),
    },
    {
      accessorKey: 'blood_group',
      header: 'Blood Group',
    },
    {
      accessorKey: 'membership_end_date',
      header: 'Membership End',
      cell: ({ row }) => format(new Date(row.original.membership_end_date), 'dd/MM/yyyy'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
          row.original.status === 'active' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.original.status}
        </span>
      ),
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact is required';
    } else if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid 10-digit contact number';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.membershipStartDate) newErrors.membershipStartDate = 'Membership start date is required';
    if (!formData.membershipEndDate) newErrors.membershipEndDate = 'Membership end date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        alternateNo: checked ? prev.contact : prev.alternateNo
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData(prev => ({ ...prev, image: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('http://localhost:3000/api/members', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          email: formData.email,
          contact: formData.contact,
          dateOfBirth: formData.dateOfBirth,
          bloodGroup: formData.bloodGroup,
          location: formData.location || null,
          address: formData.address || null,
          occupation: formData.occupation || null,
          membershipStartDate: formData.membershipStartDate,
          membershipEndDate: formData.membershipEndDate,
          image_url: formData.image || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add member');
      }

      await fetchMembers(); // Refresh the list
      setShowForm(false);
      
      // Reset form
      setFormData({
        registrationDate: new Date().toISOString().split('T')[0],
        name: '',
        contact: '',
        alternateNo: '',
        sameAsContact: false,
        gender: '',
        email: '',
        address: '',
        emergencyContact: '',
        dateOfBirth: '',
        bloodGroup: '',
        occupation: '',
        gstNumber: '',
        image: '',
        enquiryExecutive: '',
        memberExecutive: '',
        location: '',
        membershipStartDate: new Date().toISOString().split('T')[0],
        membershipEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      });
      setPreviewImage('');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <div className="container mx-auto py-6">
        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {apiError}
          </div>
        )}
        
        <DataTable
          data={members}
          columns={columns}
          onAddNew={() => setShowForm(true)}
        />
        
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Member Registration</h2>
      
      {apiError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact</label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.contact ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alternate No.</label>
            <div className="mt-1 space-y-2">
              <input
                type="tel"
                name="alternateNo"
                value={formData.alternateNo}
                onChange={handleInputChange}
                disabled={formData.sameAsContact}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="sameAsContact"
                  checked={formData.sameAsContact}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-600">Same as Contact</label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.gender ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
            <input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.bloodGroup ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
            {errors.bloodGroup && <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Membership Start Date</label>
            <input
              type="date"
              name="membershipStartDate"
              value={formData.membershipStartDate}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.membershipStartDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.membershipStartDate && <p className="mt-1 text-sm text-red-600">{errors.membershipStartDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Membership End Date</label>
            <input
              type="date"
              name="membershipEndDate"
              value={formData.membershipEndDate}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.membershipEndDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.membershipEndDate && <p className="mt-1 text-sm text-red-600">{errors.membershipEndDate}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Profile Image</label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Camera className="h-5 w-5 inline-block mr-2" />
                  Upload Photo
                </label>
              </div>
              {previewImage && (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage('');
                      setFormData(prev => ({ ...prev, image: '' }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Registering...' : 'Register Member'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberRegistration;