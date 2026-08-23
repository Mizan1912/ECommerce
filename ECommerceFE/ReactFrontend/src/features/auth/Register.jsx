import { useState } from "react";
import axios from "axios";
import { UserPlus, User, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");

    // Password must contain at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;

    if (!passwordRegex.test(formData.password)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }

    try {
      const response = await axios.post(
        "https://hfvf76kr-5000.inc1.devtunnels.ms/api/v1/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          location: formData.location,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Registration successful:", response.data);

      toast.success("Registration successful!");
      setTimeout(() => {
      navigate("/login");
    }, 1500);

    } catch (error) {
      if (error.response?.status === 409) {
         setError(
          error.response?.data?.message ||
          "Couldn't create your account."
        );
      }
    }
  }; // <-- CLOSES handleRegister

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-5xl rounded-xl border border-gray-200 p-10 shadow-sm">

        {/* Header */}
        <div className="mb-8">
          <p className="text-green-700 font-medium tracking-wide">
            REGISTER
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-black">
            Create your account
          </h1>
        </div>

        {/* Register Form */}
        <form
          className="grid gap-5"
          onSubmit={handleRegister}
        >
          <Field
            label="Name"
            name="name"
            placeholder="Full name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />

          <Field
            label="Email"
            name="email"
            placeholder="customer@example.com"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
            {error && (
            <div className="flex items-center gap-2 -mt-3 text-red-500 text-sm">
              <span className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-red-500 text-[10px] font-bold">
                !
              </span>

              <span>{error}</span>
            </div>
            )}

          <Field
            label="Password"
            name="password"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Error message */}
       
          <Field
            label="Location"
            name="location"
            placeholder="Enter your location"
            type="text"
            value={formData.location}
            onChange={handleChange}
          />

          {/* Register Button */}
          <Button type="submit">
            <UserPlus size={18} />
            Register
          </Button>
          {/* Test Toast */}
          
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200" />

        {/* Preview Customer Login */}
        <button
          type="button"
          className="w-full h-12 border border-gray-200 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50"
        >
          <User size={20} />
          Preview customer login
        </button>

        {/* Preview Admin Login */}
        <button
          type="button"
          className="mt-4 w-full h-12 border border-gray-200 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50"
        >
          <ShieldCheck size={20} />
          Preview admin login
        </button>
          
        {/* Login Link */}
        <p className="mt-8 text-center text-base">
          Already have an Account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;