import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { registerUser } from '../services/apiService';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();

  // State for the component
  const [isLoginView, setIsLoginView] = useState(true);
  const [role, setRole] = useState('');
  const [isRoleSelected, setIsRoleSelected] = useState(false);
  
  // State for all form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // --- Doctor Specific ---
  const [hospitalName, setHospitalName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [medicalRegNo, setMedicalRegNo] = useState('');
  
  // --- Pharmacist Specific ---
  const [pharmacyName, setPharmacyName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [drugLicenseNumber, setDrugLicenseNumber] = useState('');
  
  // --- Patient Specific ---
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  // NEW: State for the Patient Secret Code
  const [patientCode, setPatientCode] = useState('');

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setIsRoleSelected(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(username, password, role);

    if (result.success) {
      switch (result.data.user.role) {
        case 'doctor': navigate('/doctor-dashboard'); break;
        case 'patient': navigate('/patient-dashboard'); break;
        case 'pharmacist': navigate('/pharmacist-dashboard'); break;
        default: break;
      }
    } else {
      alert(result.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    let newUserData = { role, username, password, name };

    if (role === 'patient') {
      // NEW: Include patientCode in the registration data
      newUserData = { ...newUserData, email, mobile, dob, bloodGroup, aadhaar, patientCode };
    } else if (role === 'doctor') {
      newUserData = { ...newUserData, hospitalName, specialization, medicalRegNo };
    } else if (role === 'pharmacist') {
      newUserData = { ...newUserData, name, pharmacyName, registrationNumber, drugLicenseNumber };
    }
    
    const result = await registerUser(newUserData);
    alert(result.message);
    if (result.success) {
      setIsLoginView(true);
    }
  };

  const renderSignupFields = () => {
    switch (role) {
      case 'patient':
        return (
          <>
            <div className="input-group"><label>Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="input-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            
            {/* NEW: Patient Code Input */}
            <div className="input-group">
                <label>Create Secret Code (Share with Doctor)</label>
                <input 
                    type="text" 
                    value={patientCode} 
                    onChange={(e) => setPatientCode(e.target.value)} 
                    placeholder="e.g. MyCode@123"
                    required 
                />
            </div>

            <div className="input-group"><label>Mobile Number</label><input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required /></div>
            <div className="input-group"><label>Date of Birth</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required /></div>
            <div className="input-group"><label>Blood Group</label><input type="text" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required /></div>
            <div className="input-group"><label>Aadhaar Number</label><input type="text" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} required /></div>
          </>
        );
      case 'doctor':
        return (
          <>
            <div className="input-group"><label>Doctor Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="input-group"><label>Hospital Name</label><input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required /></div>
            <div className="input-group"><label>Specialization</label><input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required /></div>
            <div className="input-group"><label>Medical Council Reg. No.</label><input type="text" value={medicalRegNo} onChange={(e) => setMedicalRegNo(e.target.value)} required /></div>
          </>
        );
      case 'pharmacist':
        return (
          <>
            <div className="input-group"><label>Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="input-group"><label>Pharmacy Name</label><input type="text" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} required /></div>
            <div className="input-group"><label>State Pharmacy Council Reg. No.</label><input type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required /></div>
            <div className="input-group"><label>Drug License No.</label><input type="text" value={drugLicenseNumber} onChange={(e) => setDrugLicenseNumber(e.target.value)} required /></div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image-section">
        <div className="image-overlay">
          <h1>MediSure Vault</h1>
          <p>The future of secure prescription management.</p>
        </div>
      </div>
      <div className="auth-form-section">
        {isLoginView ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <h2>Login</h2>
            <div className="input-group">
              <label>Your Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="">-- Select a Role --</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
              </select>
            </div>
            <div className="input-group">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="auth-button">Login</button>
            <p className="toggle-link" onClick={() => setIsLoginView(false)}>
              Don't have an account? <strong>Sign Up</strong>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup}>
            <h2>Sign Up</h2>
            <div className="input-group">
              <label>First, Select Your Role</label>
              <select value={role} onChange={handleRoleChange} required>
                <option value="" disabled>-- Select a Role --</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
              </select>
            </div>
            {isRoleSelected && (
              <>
                {renderSignupFields()}
                <div className="input-group">
                  <label>Create Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Create Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="auth-button">Sign Up</button>
              </>
            )}
            <p className="toggle-link" onClick={() => setIsLoginView(true)}>
              Already have an account? <strong>Login</strong>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;