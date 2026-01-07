import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { registerUser } from '../services/apiService';
import { 
  FaUser, FaLock, FaEnvelope, FaPhone, FaCalendar, 
  FaTint, FaIdCard, FaHospital, FaStethoscope, FaFileMedical,
  FaStore, FaAddressCard, FaKey, FaShieldAlt
} from 'react-icons/fa';
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
  const [patientCode, setPatientCode] = useState('');

  // --- 1. CLEAR OLD DATA ON LOAD ---
  useEffect(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('my_unique_pharm_id');
  }, []);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setIsRoleSelected(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const result = await login(username, password, role);

        if (result.success) {
          if(result.data && result.data.user) {
              localStorage.setItem('user', JSON.stringify(result.data.user));
              console.log("✅ Login Successful. User Saved:", result.data.user.username);
          }

          switch (result.data.user.role) {
            case 'doctor': navigate('/doctor-dashboard'); break;
            case 'patient': navigate('/patient-dashboard'); break;
            case 'pharmacist': navigate('/pharmacist-dashboard'); break;
            default: break;
          }
        } else {
          alert(result.message);
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed. Please check your connection.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    let newUserData = { role, username, password, name };

    if (role === 'patient') {
      newUserData = { ...newUserData, email, mobile, dob, bloodGroup, aadhaar, patientCode };
    } else if (role === 'doctor') {
      // ✅ Updated: Included email and mobile in doctor data
      newUserData = { ...newUserData, hospitalName, specialization, medicalRegNo, email, mobile };
    } else if (role === 'pharmacist') {
      newUserData = { ...newUserData, name, pharmacyName, registrationNumber, drugLicenseNumber };
    }
    
    const result = await registerUser(newUserData);
    alert(result.message);
    if (result.success) {
      setIsLoginView(true);
    }
  };

  // Helper to render input with icon
  const renderInput = (label, value, setValue, type = "text", icon = null, placeholder = "") => (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input 
          type={type} 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          required 
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  const renderSignupFields = () => {
    switch (role) {
      case 'patient':
        return (
          <>
            {renderInput("Full Name", name, setName, "text", <FaUser />)}
            {renderInput("Email Address", email, setEmail, "email", <FaEnvelope />)}
            {renderInput("Secret Code (Share with Doctor)", patientCode, setPatientCode, "text", <FaKey />, "e.g. MyCode@123")}
            {renderInput("Mobile Number", mobile, setMobile, "tel", <FaPhone />)}
            {renderInput("Date of Birth", dob, setDob, "date", <FaCalendar />)}
            {renderInput("Blood Group", bloodGroup, setBloodGroup, "text", <FaTint />, "e.g. O+")}
            {renderInput("Aadhaar Number", aadhaar, setAadhaar, "text", <FaIdCard />)}
          </>
        );
      case 'doctor':
        return (
          <>
            {renderInput("Doctor Name", name, setName, "text", <FaUserMd />)}
            {/* ✅ Updated: Added Email and Mobile fields here */}
            {renderInput("Email Address", email, setEmail, "email", <FaEnvelope />)}
            {renderInput("Mobile Number", mobile, setMobile, "tel", <FaPhone />)}
            {renderInput("Hospital Name", hospitalName, setHospitalName, "text", <FaHospital />)}
            {renderInput("Specialization", specialization, setSpecialization, "text", <FaStethoscope />)}
            {renderInput("Medical Council Reg. No.", medicalRegNo, setMedicalRegNo, "text", <FaFileMedical />)}
          </>
        );
      case 'pharmacist':
        return (
          <>
            {renderInput("Pharmacist Name", name, setName, "text", <FaUser />)}
            {renderInput("Pharmacy Name", pharmacyName, setPharmacyName, "text", <FaStore />)}
            {renderInput("State Council Reg. No.", registrationNumber, setRegistrationNumber, "text", <FaAddressCard />)}
            {renderInput("Drug License No.", drugLicenseNumber, setDrugLicenseNumber, "text", <FaFileMedical />)}
          </>
        );
      default:
        return null;
    }
  };

  // Import Font for UI
  const FaUserMd = () => <FaUser />; 

  return (
    <div className="auth-container">
      {/* BACKGROUND OVERLAY */}
      <div className="auth-background-overlay"></div>

      {/* CENTERED CARD */}
      <div className="auth-card">
        
        {/* BRANDING HEADER */}
        <div className="auth-header">
            <div className="logo-circle">
                <FaShieldAlt />
            </div>
            <h1>MediSure Vault</h1>
            <p>Secure Medical Identity Portal</p>
        </div>

        {/* FORM CONTENT */}
        <div className="auth-content">
            {isLoginView ? (
            <form onSubmit={handleLogin}>
                <div className="form-toggle-title">
                    <h3>Sign In</h3>
                </div>

                <div className="input-group">
                <label>Select Role</label>
                <div className="input-wrapper">
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="">Select Role</option>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="pharmacist">Pharmacist</option>
                    </select>
                </div>
                </div>

                {renderInput("Username", username, setUsername, "text", <FaUser />, "Enter username")}
                {renderInput("Password", password, setPassword, "password", <FaLock />, "Enter password")}

                <button type="submit" className="auth-button">Sign In</button>
                
                <p className="toggle-link">
                New to MediSure? <span onClick={() => setIsLoginView(false)}>Create Account</span>
                </p>
            </form>
            ) : (
            <form onSubmit={handleSignup}>
                <div className="form-toggle-title">
                    <h3>Create Account</h3>
                </div>

                <div className="input-group">
                <label>Choose your role</label>
                <div className="input-wrapper">
                    <select value={role} onChange={handleRoleChange} required>
                        <option value="" disabled>Select Role</option>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="pharmacist">Pharmacist</option>
                    </select>
                </div>
                </div>

                {isRoleSelected && (
                <>
                    {renderSignupFields()}
                    <div className="divider"><span>Credentials</span></div>
                    {renderInput("Create Username", username, setUsername, "text", <FaUser />)}
                    {renderInput("Create Password", password, setPassword, "password", <FaLock />)}
                    
                    <button type="submit" className="auth-button">Register Account</button>
                </>
                )}
                
                <p className="toggle-link">
                Already have an account? <span onClick={() => setIsLoginView(true)}>Sign In</span>
                </p>
            </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;