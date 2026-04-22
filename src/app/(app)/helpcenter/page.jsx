"use client"

import { MdEditDocument } from "react-icons/md";
import { MdHeadsetMic } from "react-icons/md";
import { MdRocketLaunch } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import { CgNotes } from "react-icons/cg";
import { FaArrowRight } from "react-icons/fa6";
import { TbNetwork } from "react-icons/tb";
import { IoIosGlobe } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
import { useState } from "react";
import { LuMessageCircleMore } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { IoMail } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";




export default function HelpCenter() {
  // Quick Cards
  const quickStartCards = [
    {
      title: "Set Up Organisation",
      description: "Add company details and team members to get started.",
      time: "3 min setup",
    },
    {
      title: "Start Assessment",
      description: "Answer guided questions to establish your compliance baseline.",
      time: "15 min task",
    },
    {
      title: "Review Your Report",
      description: "Understand your readiness score and identify critical gaps.",
      time: "5 min review",
    },
    {
      title: "Take Actions on Gaps",
      description: "Follow recommended actions to improve your compliance.",
      time: "continuous",
    },

  ];

  // Compliance Guide Cards
  const complianceGuides = [
    {
      icon: "PDPL",
      title: "PDPL Compliance Guide",
      subtitle: "Federal Decree-Law No. 45 of 2021",
      status: "Active",
      description:
        "The UAE Personal Data Protection Law (PDPL) governs the collection, processing, and storage of personal data. This guide helps organizations understand the law, implement compliance practices, manage consent, protect sensitive data, and meet regulatory obligations. It also includes templates for policies and documentation, making compliance easier for UAE businesses of all sizes",
      button: "View PDPL Guide",
      modalDescription:
        "This guide provides a comprehensive overview of the UAE Personal Data Protection Law (PDPL), including practical steps to comply, manage consent, protect sensitive data, and implement security measures. It helps businesses understand rights, obligations, and documentation requirements.",
      keyPoints: [
        "Scope and applicability of PDPL",
        "Consent and lawful processing requirements",
        "Data subject rights and obligations",
        "Security measures and breach reporting",
        "Templates for compliance documentation"
      ],
      downloadText: "Download PDPL Guide PDF",
    },

    {
      icon: "ISO",
      title: "ISO 27001 Compliance Guide",
      subtitle: "Information Security Management Standard",
      status: "Active",
      description:
        "ISO 27001 is the international standard for information security management. This guide explains the standard’s requirements, including risk assessment, controls, and documentation. It provides practical guidance to help UAE businesses establish a robust Information Security Management System (ISMS) and prepare for audits and certification.",
      button: "View ISO 27001 Guide",
      modalDescription:
        "This guide provides a practical approach to implementing ISO 27001, helping organizations build a secure and auditable Information Security Management System (ISMS). It focuses on risk management, control implementation, and audit readiness.",
      keyPoints: [
        "Overview of ISO 27001 clauses",
        "Risk assessment and treatment",
        "Security controls implementation",
        "Audit and certification readiness",
        "Templates for policies and procedures"
      ],
      downloadText: "Download ISO 27001 Guide PDF",
    },

    {
      icon: "NESA",
      title: "NESA Compliance Guide",
      subtitle: "UAE National Electronic Security Authority Controls",
      status: "Active",
      description:
        "NESA controls provide cybersecurity requirements for UAE businesses, including policies, technical controls, and monitoring practices. This guide simplifies complex controls into actionable steps, helping organizations comply with national standards and strengthen critical infrastructure security.",
      button: "View NESA Guide",
      modalDescription:
        "This guide outlines the UAE NESA cybersecurity requirements, providing actionable steps and templates to comply with national standards. It covers practical guidance to safeguard critical systems and maintain regulatory compliance.",
      keyPoints: [
        "Core security requirements for UAE businesses",
        "Implementation guidance and checklists",
        "Compliance monitoring best practices",
        "Reporting and documentation templates"
      ],
      downloadText: "Download NESA Guide PDF",
    },
  ];

  // FAQ
  const faqData = [
    {
      question: "What is PDPL and who needs to comply?",
      answer:
        "The UAE Personal Data Protection Law (PDPL) regulates the collection, processing, and storage of personal data. All businesses operating in the UAE that handle personal data of individuals must comply with PDPL, regardless of size or industry.",
    },
    {
      question: "Does Qubey replace hiring a cybersecurity consultant?",
      answer:
        "Qubey provides AI-powered guidance and practical templates to help businesses manage compliance independently. While it reduces the need for external consultants, organizations may still consult experts for complex or specialized audits.",
    },
    {
      question: "How do I track my compliance progress in Qubey?",
      answer:
        "You can track your compliance progress through our structured dashboard. Each assessment highlights your readiness score, gaps, and recommended actions, allowing you to monitor improvements over time.",
    },
    {
      question: "Are the compliance guides downloadable?",
      answer:
        "Yes! Each compliance guide (PDPL, ISO 27001, NESA) is available for download in PDF format directly from the Help Center. Click 'View Guide' on any card and then use the 'Download PDF' button in the popup.",
    },
    {
      question: "Is Qubey specific to UAE regulations?",
      answer:
        "Absolutely. Qubey is purpose-built for UAE regulations like PDPL, ISO 27001, and NESA controls, ensuring all guidance, templates, and recommendations are fully relevant to businesses operating in the UAE.",
    },
    {
      question: "What kind of support does Qubey provide?",
      answer:
        "Qubey offers 24/7 AI-guided assistance, practical compliance recommendations, templates, and a Help Center with detailed FAQs. You can also contact support directly through chat or email for more complex queries.",
    },
  ];

  const [selectedGuide, setSelectedGuide] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="pt-6 pb-8 space-y-7 sm:space-y-12 pr-1.5 max-w-7xl mx-auto">
      {/* Welcome Message */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-bold mt-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
            How Can We Help You?
          </h1>
          <p className="font-medium text-base sm:text-lg max-w-2xl">
            Search our knowledge bases, guides or browse by topic to master your compliance journey with Qubey.
          </p>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex justify-start gap-4">
            <button type="button" className="cursor-pointer text-gray-700 rounded-4xl bg-slate-100/80 border border-gray-300 shadow-md
                hover:bg-[#761be6] hover:text-white hover:scale-95 px-3 md:px-4 py-2 flex items-center gap-2 transition-all duration-300">
              <MdEditDocument className="size-4 md:size-5 shrink-0" />
              <span className="text-sm sm:text-base md:font-medium">Latest Updates</span>
            </button>

            <button className="cursor-pointer rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] 
              px-3 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
              <MdHeadsetMic className="size-4 md:size-5 text-white shrink-0" />
              <span className="text-sm sm:text-base md:font-medium text-white">Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg bg-linear-to-br from-purple-100 via-white to-white px-6 py-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-12 items-center justify-center rounded-full bg-purple-50 border border-purple-200 shrink-0">
            <MdRocketLaunch className="relative text-2xl text-purple-700 shrink-0" />
          </div>
          <div className="relative">
            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Quick Start Guide</span>
            </h2>
            <p className="text-sm sm:text-base font-medium text-gray-700">Follow these simple steps to set up your dashboard and start tracking compliance with confidence.</p>
          </div>
        </div>

        <div className="relative border-b border-purple-300 my-3"></div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch mt-5">
          {quickStartCards?.map((card, id) => (
            <div key={id} className="relative z-10">
              <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.08)] border border-gray-200 p-4 sm:p-5">
                {/* Header */}
                <h6 className="shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium">
                  0{id + 1}
                </h6>
                <div className="border-b border-purple-300 my-3"></div>

                <h2 className="my-1 font-semibold sm:text-lg md:text-xl">
                  <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                    {card.title}
                  </span>
                </h2>
                <p className="text-sm text-gray-700">{card.description}</p>

                <div className="flex items-center gap-1.5 mt-4 text-gray-700">
                  <FiClock className="shrink-0 size-3" />
                  <p className="text-xs">{card.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Compliance Guide */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-3 sm:px-6 py-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-12 items-center justify-center rounded-full bg-purple-100 border border-purple-200 shrink-0">
            <FaShieldAlt className="relative text-2xl text-purple-700 shrink-0" />
          </div>
          <div className="relative">
            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Compliance Guidance</span>
            </h2>
            <p className="text-sm sm:text-base font-medium text-gray-700">Learn about key compliance frameworks and access official guidelines to stay aligned with industry standards.</p>
          </div>
        </div>

        <div className="relative border-b border-purple-300 my-3"></div>

        {/* Actions */}
        <div className="space-y-3">
          {complianceGuides?.map((guide, id) => (
            <div key={id} className="px-2 sm:px-4 lg:px-6 pt-6 space-y-4 sm:space-y-6">
              <div className="p-4 rounded-xl border border-purple-300 bg-white transition-all duration-300 group">
                <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-3 lg:gap-4 mb-4">
                  <h3 className="font-semibold text-xl flex items-center gap-3">
                    <div className="shrink-0 relative flex size-10 items-center justify-center rounded-full bg-purple-100">
                      {guide.icon === "PDPL" && (
                        <CgNotes className="size-5 text-purple-700" />
                      )}
                      {guide.icon === "ISO" && (
                        <IoIosGlobe className="size-5 text-purple-700" />
                      )}
                      {guide.icon === "NESA" && (
                        <TbNetwork className="size-5 text-purple-700" />
                      )}

                    </div>
                    <span className="flex flex-col bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                      {guide.title}
                      <span className="text-sm font-medium text-gray-600">{guide.subtitle}</span>
                    </span>
                  </h3>

                  <span className="w-fit text-xs font-medium text-white bg-green-600 shadow-sm rounded-full px-2 py-1 uppercase">
                    {guide.status}
                  </span>
                </div>

                <p className="px-3 sm:px-4 py-3 rounded-xl border text-sm md:text-base font-medium text-gray-700 border-purple-300 border-dashed bg-purple-50">
                  {guide.description}
                </p>

                <button onClick={() => setSelectedGuide(guide)}
                  className="relative inline-flex items-center text-sm md:text-base mt-3 sm:mt-4 gap-1 px-1 font-medium cursor-pointer bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-linear-to-r after:from-[#761be6] after:to-[#441851] after:transition-all after:duration-300 group-hover:after:w-full">
                  {guide.button}
                  <FaArrowRight className="text-purple-700" />
                </button>
              </div>
            </div>
          ))}

          {selectedGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
              <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-md sm:max-w-xl px-6 pb-6 pt-12">
                <RxCrossCircled onClick={() => setSelectedGuide(null)}
                  className="size-7 text-purple-600 shrink-0 cursor-pointer absolute top-4 right-4 hover:scale-95 transition-all" />

                {/* Heading */}
                <h2 className="font-semibold text-xl sm:text-2xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                  {selectedGuide.title}
                </h2>

                {/* Description */}
                <p className="text-gray-800 text-sm mt-2 mb-3">
                  {selectedGuide.modalDescription}
                </p>

                <ul className="list-disc list-inside text-gray-800 text-sm mb-3 space-y-1">
                  {selectedGuide.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 flex-wrap pt-4">
                  <button onClick={() => setSelectedGuide(null)}
                    className="cursor-pointer hidden sm:block px-8 py-2 rounded-lg bg-slate-100/80 border border-gray-300 shadow-md hover:bg-[#761be6] hover:text-white transition-all duration-300">
                    Close
                  </button>

                  <button
                    // onClick={handleUnlink}
                    className="cursor-pointer px-4 py-2 rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] text-white hover:from-[#5e1dbf] hover:to-[#8b2bf0]">
                    {selectedGuide.downloadText}
                  </button>

                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="relative overflow-hidden rounded-2xl bg-white px-3 sm:px-6 py-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-12 items-center justify-center rounded-full bg-purple-100 border border-purple-200 shrink-0">
            <LuMessageCircleMore className="relative text-2xl text-purple-700 shrink-0" />
          </div>
          <div className="relative">
            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-sm sm:text-base font-medium text-gray-700">Quick answers to the most commonly asked questions by our users.</p>
          </div>
        </div>

        <div className="relative border-b border-purple-300 my-3"></div>

        {/* FAQ Accordion */}
        <div className="space-y-4 pt-6">
          {faqData.map((item, index) => (
            <div key={index} className="border border-purple-300 rounded-xl overflow-hidden bg-purple-50">
              <button onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center gap-3 px-4 md:px-6 py-3 sm:py-4 cursor-pointer text-left font-medium text-gray-800 hover:bg-purple-100 transition-colors">
                <span className="text-sm sm:text-base">{item.question}</span>
                {openIndex === index ? (
                  <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                    <IoIosArrowUp className="text-white" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                    <IoIosArrowDown className="text-white" />
                  </div>
                )}
              </button>

              <div className={`px-4 md:px-6 text-gray-700 border-purple-300 text-xs sm:text-sm font-medium  transition-all duration-300 
              ${openIndex === index ? "max-h-96 py-3 border-t" : "max-h-0 py-0 border-t-0"} `}>
                {item.answer}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Contact Us */}
      <div className="overflow-hidden rounded-2xl shadow-lg bg-linear-to-br from-purple-600 via-purple-400 to-purple-400 p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-7">
          <div className="lg:w-1/2 flex flex-col items-start gap-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-purple-50 border border-purple-200 shrink-0">
              <MdHeadsetMic className="relative text-2xl text-purple-700 shrink-0" />
            </div>
            <h2 className="font-semibold text-xl sm:text-2xl text-white">
              Need Assistance?
            </h2>
            <p className="text-sm sm:text-base font-medium text-gray-100 max-w-[90%]">
              Our support team is here to help you 24/7. Reach out via email, chat, or phone for any questions related to compliance or using Qubey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-1/2">
            {/* Email Box */}
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl text-white flex flex-col items-center text-center">
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                <div className="size-7 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <IoMail className="text-purple-700 text-base" />
                </div>
                <h3 className="font-semibold text-white text-base sm:text-lg">
                  Email Support
                </h3>
              </div>

              <a href="mailto:support@qubey.com" className="relative inline-block group">
                <span className="text-sm sm:text-base break-all">
                  support@qubey.com
                </span>
                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>

              <p className="text-xs sm:text-sm mt-1">
                Response within 24 hours
              </p>
            </div>

            {/* Call Box */}
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl text-white flex flex-col items-center text-center">
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                <div className="size-7 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <FaPhoneAlt className="text-purple-700 text-sm" />
                </div>
                <h3 className="font-semibold text-white text-base sm:text-lg">
                  Schedule a Call
                </h3>
              </div>

              <a href="tel:+919876543210" className="relative inline-block group">
                <span className="text-sm sm:text-base">
                  +91 98765 43210
                </span>
                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>

              <p className="text-xs sm:text-sm mt-1">
                15 min Onboarding session
              </p>
            </div>

            {/* Button */}
            <button className="sm:col-span-2 w-full cursor-pointer bg-white text-purple-700 flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl font-semibold hover:scale-95 transition-all duration-300">
              <FaCalendarAlt />
              <span className="text-sm sm:text-base">
                Book a Consultation
              </span>
            </button>

          </div>
        </div>
      </div>
    </section >
  )
}
