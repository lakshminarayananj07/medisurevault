// This file simulates our database until the backend is ready.

export const mockUsers = [
  // Doctors
  { id: 'doc1', username: 'dr.sharma', password: 'password', role: 'doctor', name: 'Dr. Anya Sharma', hospital: 'City General Hospital', specialization: 'Cardiologist', medicalRegNo: 'NMC/IMG/12345' },
  // Patients
  { id: 'pat1', username: 'john.doe', password: 'password', role: 'patient', name: 'John Doe', email: 'john.doe@example.com',  mobile: '9876543210', dob: '1990-05-15', address: '123 Main St, Anytown, 12345', bloodGroup: 'O+', aadhaar: '1234 5678 9012' },
  { id: 'pat2', username: 'jane.smith', password: 'password', role: 'patient', name: 'Jane Smith', email: 'jane.smith@example.com', mobile: '9876543211', dob: '1992-08-22', address: '456 Oak Ave, Otherville, 67890', bloodGroup: 'A-', aadhaar: '2109 8765 4321' },
  // Pharmacists
  { id: 'phm1', username: 'pharma.joe', password: 'password', role: 'pharmacist', name: 'Joe Brown', pharmacyName: 'HealthFirst Pharmacy', registrationNumber: 'TN-1987-A1', drugLicenseNumber: 'TN/CHN/12345/2024' },
];

export const mockMedicines = [
  { id: 'med1', name: 'Paracetamol', type: 'Tablet', strengths: ['250mg', '500mg', '650mg'] },
  { id: 'med2', name: 'Amoxicillin', type: 'Tablet', strengths: ['250mg', '500mg'] },
  { id: 'med3', name: 'Ibuprofen', type: 'Tablet', strengths: ['200mg', '400mg'] },
  { id: 'med4', name: 'Cough Syrup', type: 'Syrup', volumes: ['100ml', '150ml'] },
  { id: 'med5', name: 'Antacid Syrup', type: 'Syrup', volumes: ['150ml', '200ml'] },
];

export const mockDiagnoses = [
  'Common Cold',
  'Influenza (Flu)',
  'Strep Throat',
  'Hypertension',
  'Diabetes - Type 2',
  'Migraine',
  'Allergic Rhinitis',
  'Gastroenteritis',
  'Urinary Tract Infection',
  'Fever of Unknown Origin',
  'Cough',
  'Unidentified',
];

// V V V THIS IS THE SECTION THAT NEEDS TO BE ADDED V V V
// ... (at the end of the file)
// ... (at the end of the file, replace the old mockNews array)

export const mockNews = [
  { 
    id: 1, 
    title: 'Breakthrough in Cardiology: New Stent Technology Approved', 
    source: 'Global Health Times', 
    date: '2025-09-22',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop' 
  },
  { 
    id: 2, 
    title: 'Annual Flu Vaccination Drive Begins Across the Country', 
    source: 'National Medical Journal', 
    date: '2025-09-21',
    // This is the new, corrected image URL for the second item
    imageUrl: 'https://images.unsplash.com/photo-1583324113620-910f74a8c92a?q=80&w=2070&auto=format&fit=crop'
  },
  { 
    id: 3, 
    title: 'Study Links Vitamin D to Improved Immune Response', 
    source: 'Science Today', 
    date: '2025-09-20',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop'
  },
  { 
    id: 4, 
    title: 'AI in Diagnostics: Study Shows Promise in Early Detection', 
    source: 'Tech Health Weekly', 
    date: '2025-09-19',
    imageUrl: 'https://images.unsplash.com/photo-1532187643623-dbf26353d395?q=80&w=2070&auto=format&fit=crop'
  },
  { 
    id: 5, 
    title: 'New Guidelines for Workplace Wellness and Mental Health', 
    source: 'Corporate Wellness Mag', 
    date: '2025-09-18',
    imageUrl: 'https://images.unsplash.com/photo-1598214886806-2c88b81b434b?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 6,
    title: 'Robotic Surgery Reaches New Milestone in Complex Procedures',
    source: 'Future Medicine',
    date: '2025-09-17',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop'
  }
];