import React, { useState } from "react";
import "./Languages.css";
import { useTranslation } from "react-i18next";
import axios from "axios";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

function Langs() {
  const { t, i18n } = useTranslation("translations");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [languageToChange, setLanguageToChange] = useState("");
  const [isFrench, setIsFrench] = useState(i18n.language === "fr");

  const languages = [
    { code: "en", lang: "English" },
    { code: "fr", lang: "Français" },
    { code: "sp", lang: "Español" },
    { code: "po", lang: "Português" },
    { code: "ch", lang: "Chinese" },
    { code: "hi", lang: "हिन्दी" },
    { code: "te", lang: "తెలుగు" },
    { code: "ta", lang: "தமிழ்" },
  ];

  const handleLanguageSelect = (code) => {
    setLanguageToChange(code);
    const isSelectedFrench = code === "fr";
    setIsFrench(isSelectedFrench);
    setOtpSent(false);

    // Clear the input fields
    setPhoneNumber("");
    setEmail("");
    setOtp("");
  };

  const handleSendOtp = async () => {
    try {
      if (isFrench) {
        await axios.post("https://twitter-cxhu.onrender.com/send-email-otp", {
          email,
        });
        alert("OTP sent to your email");
      } else if (isValidPhoneNumber(phoneNumber)) {
        await axios.post("https://twitter-cxhu.onrender.com/send-sms-otp", {
          phoneNumber,
        });
        alert("OTP sent to your mobile number");
      } else {
        alert("Please enter a valid phone number.");
        return;
      }
      setOtpSent(true);
    } catch (error) {
      console.error(
        "Error sending OTP:",
        error.response ? error.response.data : error.message
      );
      alert(
        "Failed to send OTP: " +
          (error.response ? error.response.data.error : error.message)
      );
    }
  };

  const handleSubmitOtp = async () => {
    if (otpSent) {
      // Ensure OTP is exactly 4 characters
      if (otp.length !== 4) {
        alert("OTP must be exactly 4 characters.");
        return;
      }

      try {
        const endpoint = isFrench ? "verify-email-otp" : "verify-sms-otp";
        const payload = isFrench ? { email, otp } : { phoneNumber, otp };

        const response = await axios.post(
          `https://twitter-cxhu.onrender.com/${endpoint}`,
          payload
        );

        if (response.status === 200) {
          await i18n.changeLanguage(languageToChange);
          setOtpSent(false);
          setOtp("");
          alert("OTP Verified Successfully. Language Changed.");
        } else {
          alert("Invalid OTP");
        }
      } catch (error) {
        console.error("Error verifying OTP:", error.response || error.message);
        alert("Failed to verify OTP.");
      }
    }
  };

  return (
    <div className="language-selector">
      <h2 className="select-language">{t("Select Language")}</h2>
      <div>
        {languages.map((lng) => (
          <button
            className="btn-lang"
            key={lng.code}
            onClick={() => handleLanguageSelect(lng.code)}>
            {lng.lang}
          </button>
        ))}
      </div>

      {isFrench ? (
        <div className="input">
          <div className="field">
            <input
              className="email"
              type="email"
              placeholder={t("Enter your email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
            />
            <button onClick={handleSendOtp} className="otp-btn">
              {t("Send")}
            </button>
          </div>
        </div>
      ) : (
        <div className="input">
          <div className="field">
            <PhoneInput
              international
              defaultCountry="IN" // Set a default country if preferred
              className="email"
              placeholder={t("Enter your phone number")}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              value={phoneNumber}
              onChange={setPhoneNumber}
              error={
                phoneNumber && !isValidPhoneNumber(phoneNumber)
                  ? t("Invalid Phone Number")
                  : undefined
              }
            />
            <button onClick={handleSendOtp} className="otp-btn">
              {t("Send")}
            </button>
          </div>
        </div>
      )}

      {otpSent && (
        <div className="input">
          <div className="field">
            <input
              className="email"
              type="text"
              placeholder={t("Enter OTP")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="4"
              onKeyDown={(e) => e.key === "Enter" && handleSubmitOtp()}
            />
            <button className="otp-btn" onClick={handleSubmitOtp}>
              {t("Submit OTP")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Langs;
