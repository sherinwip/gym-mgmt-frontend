import React, { useState, useEffect } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/DataTable';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

interface APIEnquiry {
  id: string;
  name: string;
  gender: string | null;
  email: string;
  contact: string;
  date_of_birth: string | null;
  blood_group: string | null;
  location: string | null;
  address: string | null;
  occupation: string | null;
  enquiry_type: string;
  source: string;
  referred_by: string | null;
  rating: number | null;
  call_response: string | null;
  budget: string;
  executive_name: string;
  next_follow_up_date: string;
  image_url: string | null;
  thumbnail_url: string | null;
  comments: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface EnquiryData {
  date: string;
  name: string;
  gender: string;
  email: string;
  contact: string;
  dateOfBirth: string;
  bloodGroup: string;
  location: string;
  address: string;
  occupation: string;
  enquiryType: string;
  source: string;
  referredBy: string;
  rating: number;
  callResponse: string;
  budget: string;
  executiveName: string;
  nextFollowUpDate: string;
  image: string;
  comments: string;
}

interface FormErrors {
  [key: string]: string;
}

const Enquiry = () => {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [enquiries, setEnquiries] = useState<APIEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EnquiryData>({
    date: new Date().toISOString().split('T')[0],
    name: '',
    gender: '',
    email: '',
    contact: '',
    dateOfBirth: '',
    bloodGroup: '',
    location: '',
    address: '',
    occupation: '',
    enquiryType: '',
    source: '',
    referredBy: '',
    rating: 0,
    callResponse: '',
    budget: '',
    executiveName: '',
    nextFollowUpDate: '',
    image: '',
    comments: ''
  });

  const [previewImage, setPreviewImage] = useState('');

  const fetchEnquiries = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('http://localhost:3000/api/enquiries', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enquiries');
      }

      const data = await response.json();
      setEnquiries(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to fetch enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch enquiries when component mounts and when location changes
  useEffect(() => {
    fetchEnquiries();
  }, [location.pathname]);

  const columns: ColumnDef<APIEnquiry>[] = [
    {
      accessorKey: 'created_at',
      header: 'Date',
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
      accessorKey: 'enquiry_type',
      header: 'Enquiry Type',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.enquiry_type}</span>
      ),
    },
    {
      accessorKey: 'next_follow_up_date',
      header: 'Next Follow Up',
      cell: ({ row }) => format(new Date(row.original.next_follow_up_date), 'dd/MM/yyyy'),
    },
    {
      accessorKey: 'executive_name',
      header: 'Executive',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
          row.original.status === 'new' ? 'bg-blue-100 text-blue-800' :
          row.original.status === 'converted' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
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
    if (!formData.enquiryType) newErrors.enquiryType = 'Enquiry type is required';
    if (!formData.source) newErrors.source = 'Source is required';
    if (!formData.budget) newErrors.budget = 'Budget is required';
    if (!formData.executiveName) newErrors.executiveName = 'Executive name is required';
    if (!formData.nextFollowUpDate) newErrors.nextFollowUpDate = 'Next follow up date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

      const response = await fetch('http://localhost:3000/api/enquiries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          enquiry_type: formData.enquiryType,
          source: formData.source,
          budget: parseFloat(formData.budget),
          executive_name: formData.executiveName,
          next_follow_up_date: formData.nextFollowUpDate,
          gender: formData.gender || null,
          date_of_birth: formData.dateOfBirth || null,
          blood_group: formData.bloodGroup || null,
          location: formData.location || null,
          address: formData.address || null,
          occupation: formData.occupation || null,
          referred_by: formData.referredBy || null,
          rating: formData.rating || null,
          call_response: formData.callResponse || null,
          comments: formData.comments || null,
          image_url: formData.image || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add enquiry');
      }

      await fetchEnquiries(); // Refresh the list
      setShowForm(false);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: '',
        gender: '',
        email: '',
        contact: '',
        dateOfBirth: '',
        bloodGroup: '',
        location: '',
        address: '',
        occupation: '',
        enquiryType: '',
        source: '',
        referredBy: '',
        rating: 0,
        callResponse: '',
        budget: '',
        executiveName: '',
        nextFollowUpDate: '',
        image: '',
        comments: ''
      });
      setPreviewImage('');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to add enquiry');
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
          data={enquiries}
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
      <h2 className="text-2xl font-bold mb-6">New Enquiry</h2>
      
      {apiError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

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

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.occupation ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Enquiry Type</label>
            <select
              name="enquiryType"
              value={formData.enquiryType}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.enquiryType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              <option value="membership">Membership</option>
              <option value="personalTraining">Personal Training</option>
              <option value="groupClasses">Group Classes</option>
              <option value="other">Other</option>
            </select>
            {errors.enquiryType && <p className="mt-1 text-sm text-red-600">{errors.enquiryType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.source ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Source</option>
              <option value="walkIn">Walk-in</option>
              <option value="referral">Referral</option>
              <option value="social">Social Media</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
            {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.budget ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Executive Name</label>
            <input
              type="text"
              name="executiveName"
              value={formData.executiveName}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.executiveName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.executiveName && <p className="mt-1 text-sm text-red-600">{errors.executiveName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Next Follow Up Date</label>
            <input
              type="date"
              name="nextFollowUpDate"
              value={formData.nextFollowUpDate}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.nextFollowUpDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.nextFollowUpDate && <p className="mt-1 text-sm text-red-600">{errors.nextFollowUpDate}</p>}
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

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Comments</label>
            <textarea
              name="comments"
              rows={4}
              value={formData.comments}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.comments ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.comments && <p className="mt-1 text-sm text-red-600">{errors.comments}</p>}
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
            {isSubmitting ? 'Saving...' : 'Save Enquiry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Enquiry;