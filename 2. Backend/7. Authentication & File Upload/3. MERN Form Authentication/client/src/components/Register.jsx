import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const { isAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleRegister = async (data) => {
    // Validate phone number (must be 10 digits)
    if (!data.phone || data.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    // Validate role
    if (!data.role) {
      toast.error("Please select a role (Student or Admin)");
      return;
    }
    
    // Add +91 prefix to phone
    data.phone = `+91${data.phone}`;
    
    try {
      const res = await axios.post("http://localhost:4000/api/v1/user/register", data, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      toast.success(res.data.message);
      navigateTo(`/otp-verification/${data.email}/${data.phone}`);
    } catch (error) {
      console.error("Registration Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <div>
        <form
          className="auth-form"
          onSubmit={handleSubmit((data) => handleRegister(data))}
        >
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Name"
            {...register("name", { 
              required: "Name is required",
              minLength: { value: 3, message: "Name must be at least 3 characters" }
            })}
          />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
          
          <input
            type="email"
            placeholder="Email"
            {...register("email", { 
              required: "Email is required",
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
            })}
          />
          {errors.email && <span className="error-text">{errors.email.message}</span>}
          
          <div>
            <span>+91</span>
            <input
              type="tel"
              placeholder="10-digit phone"
              {...register("phone", { 
                required: "Phone is required",
                pattern: { value: /^[6-9]\d{9}$/, message: "Enter valid 10-digit phone number" }
              })}
            />
          </div>
          {errors.phone && <span className="error-text">{errors.phone.message}</span>}
          
          <input
            type="password"
            placeholder="Password"
            {...register("password", { 
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              maxLength: { value: 32, message: "Password must not exceed 32 characters" }
            })}
          />
          {errors.password && <span className="error-text">{errors.password.message}</span>}

          <select
            {...register("role", { required: "Select a role" })}
            defaultValue=""
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <span className="error-text">{errors.role.message}</span>}
          <div className="verification-method">
            <p>Select Verification Method</p>
            <div className="wrapper">
              <label>
                <input
                  type="radio"
                  value={"email"}
                  {...register("verificationMethod", { required: "Select verification method" })}
                />
                Email
              </label>
              <label>
                <input
                  type="radio"
                  value={"phone"}
                  {...register("verificationMethod", { required: "Select verification method" })}
                />
                Phone
              </label>
            </div>
          </div>
          {errors.verificationMethod && <span className="error-text">{errors.verificationMethod.message}</span>}
          <button type="submit">Register</button>
        </form>
      </div>
    </>
  );
};

export default Register;