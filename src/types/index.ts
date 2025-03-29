export interface Member {
  id: string;
  name: string;
  image: string;
  inDateTime: string;
  balance: number;
}

export interface EnquiryData {
  status: 'converted' | 'expected' | 'not_interested' | 'hot' | 'cold';
  count: number;
}

export interface Birthday {
  id: string;
  name: string;
  image: string;
  date: string;
  type: 'member' | 'staff';
}

export interface EnquiryForm {
  date: string;
  name: string;
  gender: 'male' | 'female' | 'other';
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
  budget: number;
  executiveName: string;
  nextFollowUpDate: string;
  image: string;
  comments: string;
}