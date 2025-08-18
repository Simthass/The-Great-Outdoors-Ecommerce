import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ message: "", error: false });
  const [submitting, setSubmitting] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    marginTop: "8px",
    borderRadius: "10px",
    border: "2px solid #e5e7eb",
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    backgroundColor: "#ffffff",
    outline: "none",
  };

  const inputFocusStyle = {
    borderColor: "#7BC043",
    boxShadow: "0 0 0 3px rgba(123, 192, 67, 0.1)",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, phone, email, subject, message } = formData;

    if (!name || !phone || !email || !subject || !message) {
      setStatus({ message: "Please fill in all fields.", error: true });
      return;
    }

    if (!isValidEmail(email)) {
      setStatus({
        message: "Please enter a valid email address.",
        error: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
      setStatus({
        message: data.message || "Message sent successfully!",
        error: false,
      });
    } catch (err) {
      setStatus({
        message: err.message || "Failed to send message",
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const ContactRow = ({ iconPath, title, children }) => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        marginBottom: "28px",
        padding: "12px 0",
        transition: "transform 0.2s ease",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #7BC043 0%, #6BA83A 100%)",
          padding: "12px",
          marginRight: "20px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "48px",
          minHeight: "48px",
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(123, 192, 67, 0.25)",
        }}
      >
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d={iconPath} />
        </svg>
      </div>
      <div style={{ flex: 1, paddingTop: "2px" }}>
        <p
          style={{
            fontWeight: "700",
            marginBottom: "8px",
            color: "#1f2937",
            fontSize: "16px",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </p>
        <div style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6" }}>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
          Contact Us
        </p>
      </div>
      <div
        style={{
          padding: "60px 24px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "48px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Left: Contact Form */}
          <div
            style={{
              flex: "1 1 520px",
              backgroundColor: "#ffffff",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ marginBottom: "36px" }}>
              <h2
                style={{
                  fontWeight: "800",
                  fontSize: "32px",
                  color: "#1f2937",
                  marginBottom: "16px",
                  letterSpacing: "-0.02em",
                  lineHeight: "1.2",
                }}
              >
                Contact us Today
              </h2>
              <p
                style={{
                  marginBottom: "0",
                  lineHeight: "1.7",
                  color: "#6b7280",
                  fontSize: "16px",
                }}
              >
                We're Here to Help You Gear Up! Have questions about our
                products, your order, or planning your next adventure? Our team
                of outdoor enthusiasts is ready to guide you every step of the
                way.
              </p>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <label
                    htmlFor="name"
                    style={{
                      display: "block",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Your Name"
                    style={inputStyle}
                    onFocus={(e) =>
                      Object.assign(e.target.style, inputFocusStyle)
                    }
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <label
                    htmlFor="phone"
                    style={{
                      display: "block",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter Your Phone Number"
                    style={inputStyle}
                    onFocus={(e) =>
                      Object.assign(e.target.style, inputFocusStyle)
                    }
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email"
                    style={inputStyle}
                    onFocus={(e) =>
                      Object.assign(e.target.style, inputFocusStyle)
                    }
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <label
                    htmlFor="subject"
                    style={{
                      display: "block",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter Your Subject"
                    style={inputStyle}
                    onFocus={(e) =>
                      Object.assign(e.target.style, inputFocusStyle)
                    }
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  style={{
                    display: "block",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                    letterSpacing: "0.01em",
                  }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter Your Message"
                  style={{
                    ...inputStyle,
                    height: "140px",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) =>
                    Object.assign(e.target.style, inputFocusStyle)
                  }
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                onClick={handleSubmit}
                style={{
                  background: submitting
                    ? "linear-gradient(135deg, #a1c87f 0%, #93b873 100%)"
                    : "linear-gradient(135deg, #7BC043 0%, #6BA83A 100%)",
                  color: "white",
                  padding: "16px 24px",
                  border: "none",
                  borderRadius: "12px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "16px",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  boxShadow: submitting
                    ? "0 4px 12px rgba(161, 200, 127, 0.3)"
                    : "0 6px 16px rgba(123, 192, 67, 0.4)",
                  transform: submitting ? "translateY(1px)" : "translateY(0)",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 8px 20px rgba(123, 192, 67, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 6px 16px rgba(123, 192, 67, 0.4)";
                  }
                }}
              >
                {submitting ? "Submitting..." : "Submit Now"}
              </button>

              {status.message && (
                <div
                  role="alert"
                  aria-live="polite"
                  style={{
                    color: status.error ? "#dc2626" : "#059669",
                    backgroundColor: status.error ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${status.error ? "#fecaca" : "#bbf7d0"}`,
                    padding: "12px 16px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {status.message}
                </div>
              )}
            </div>
          </div>

          {/* Right: Reach Out */}
          <div
            style={{
              flex: "1 1 360px",
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9",
              height: "fit-content",
            }}
          >
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#1f2937",
                  marginBottom: "16px",
                  letterSpacing: "-0.02em",
                  lineHeight: "1.2",
                }}
              >
                Reach Out
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "0",
                  lineHeight: "1.7",
                  fontSize: "15px",
                }}
              >
                Come visit or connect with us! We're always excited to meet
                fellow adventurers — whether you're stopping by in person or
                reaching out from the wild. Here's how you can get in touch:
              </p>
            </div>

            <div style={{ color: "#374151" }}>
              <ContactRow
                title="Territorial Office"
                iconPath="M12 11c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm0 10c-3.866-4.092-6-7.312-6-10a6 6 0 1112 0c0 2.688-2.134 5.908-6 10z"
              >
                <p style={{ margin: 0, fontWeight: "500" }}>
                  35T, First Floor, Liberty Plaza, Colombo - 03
                </p>
              </ContactRow>

              <ContactRow
                title="Talk to Us"
                iconPath="M3 5a2 2 0 012-2h1l2 5-2 1a11 11 0 006 6l1-2 5 2v1a2 2 0 01-2 2h-1c-7.732 0-14-6.268-14-14z"
              >
                <p style={{ margin: 0, fontWeight: "500" }}>
                  +94 764078448 / +94 705702579
                </p>
              </ContactRow>

              <ContactRow
                title="Let's Chat"
                iconPath="M4 4h16v16H4z M22 6l-10 7L2 6"
              >
                <p style={{ margin: 0, fontWeight: "500" }}>
                  Sinthass@outlook.com
                </p>
              </ContactRow>

              <ContactRow
                title="Opening Hours"
                iconPath="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              >
                <p style={{ margin: 0, fontWeight: "500" }}>
                  Monday - Saturday : 10.00AM – 07.00PM
                </p>
              </ContactRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
