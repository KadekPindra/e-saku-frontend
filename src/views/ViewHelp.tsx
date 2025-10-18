import {
  ChevronDown,
  CircleHelp,
  Search,
  Mail,
  Phone,
  ExternalLink,
  Shield,
  Book,
  HelpCircle,
} from "lucide-react";
import { useState, useRef, useEffect, ReactNode } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
  icon?: ReactNode;
  category?: string;
}

interface PolicyItemProps {
  title: string;
  content: string;
  icon?: ReactNode;
}

interface FAQItemData extends FAQItemProps {
  id: string;
}

interface PolicyItemData extends PolicyItemProps {
  id: string;
}

const FAQItem = ({ question, answer, icon, category }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
      {category && (
        <div className="bg-green-50 px-4 py-1 text-xs font-medium text-green-600">
          {category}
        </div>
      )}
      <button
        className={`w-full flex items-center p-4 cursor-pointer transition-colors duration-300 ${
          isOpen ? "bg-green-50" : "bg-white hover:bg-gray-50"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question
          .replace(/\s+/g, "-")
          .toLowerCase()}`}
      >
        <div className="flex items-center justify-center p-2 mr-4 rounded-full bg-green-100 text-green-600">
          {icon || <HelpCircle size={20} />}
        </div>
        <h3 className="flex-1 font-medium text-gray-800 text-left">
          {question}
        </h3>
        <ChevronDown
          className={`text-gray-500 transition-transform duration-300 ease-in-out ${
            isOpen ? "transform rotate-180" : ""
          }`}
          size={20}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: `${contentHeight}px` }}
        id={`faq-answer-${question.replace(/\s+/g, "-").toLowerCase()}`}
        role="region"
      >
        <div ref={contentRef} className="p-4 sm:p-6 text-gray-600 bg-white">
          {answer}
        </div>
      </div>
    </div>
  );
};

const PolicyItem = ({ title, content, icon }: PolicyItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
      <button
        className={`w-full flex items-center p-4 cursor-pointer transition-colors duration-300 ${
          isOpen ? "bg-green-50" : "bg-white hover:bg-gray-50"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`policy-content-${title
          .replace(/\s+/g, "-")
          .toLowerCase()}`}
      >
        <div className="flex items-center justify-center p-2 mr-4 rounded-full bg-green-100 text-green-600">
          {icon || <Shield size={20} />}
        </div>
        <h3 className="flex-1 font-medium text-gray-800 text-left">{title}</h3>
        <ChevronDown
          className={`text-gray-500 transition-transform duration-300 ease-in-out ${
            isOpen ? "transform rotate-180" : ""
          }`}
          size={20}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: `${contentHeight}px` }}
        id={`policy-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
        role="region"
      >
        <div ref={contentRef} className="p-4 sm:p-6 text-gray-600 bg-white">
          {content || "Default content"}
        </div>
      </div>
    </div>
  );
};

const ContactCard = ({
  title,
  description,
  icon,
  actionText,
  actionUrl,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  actionText: string;
  actionUrl: string;
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-full bg-green-100 text-green-600 mr-4">
          {icon}
        </div>
        <h3 className="font-medium text-lg">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <a
        href={actionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
      >
        {actionText} <ExternalLink size={16} className="ml-1" />
      </a>
    </div>
  );
};

const ViewHelpPreview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  const [isLoading, setIsLoading] = useState(true);

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = {
    faq: useRef<HTMLButtonElement>(null),
    policy: useRef<HTMLButtonElement>(null),
    contact: useRef<HTMLButtonElement>(null),
  };

  const updateIndicator = () => {
    const activeTabElement = tabRefs[activeTab as keyof typeof tabRefs].current;

    if (activeTabElement && tabsRef.current) {
      const tabRect = activeTabElement.getBoundingClientRect();
      const navRect = tabsRef.current.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - navRect.left,
        width: tabRect.width,
      });
    }
  };

  useEffect(() => {
    if (!isLoading) {
      updateIndicator();
    }

    window.addEventListener("resize", updateIndicator);
    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeTab, isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        updateIndicator();
      }, 50);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const faqItems: FAQItemData[] = [
    {
      id: "what-is-esaku",
      question: "What is E-Saku?",
      answer:
        "E-Saku is a digital platform used by schools to track, monitor, and manage students' achievements and disciplinary records. With E-Saku, teachers, students, and parents can monitor academic progress and student behavior transparently.",
      category: "General",
      icon: <HelpCircle size={20} />,
    },
    {
      id: "who-can-access",
      question: "Who can access E-Saku?",
      answer:
        "E-Saku can be accessed by school administrators, teachers, students, and parents. Each user type has different access levels and permissions based on their role.",
      category: "Access & Permissions",
    },
    {
      id: "data-security",
      question: "Is students data on E-Saku secure?",
      answer:
        "Yes, E-Saku implements strong security measures to protect all student data. We use encryption, secure authentication, and regular security audits to ensure data privacy and protection.",
      icon: <Shield size={20} />,
      category: "Security & Privacy",
    },
    {
      id: "password-reset",
      question: "How do I reset my password?",
      answer:
        "To reset your password, click on the 'Forgot Password' link on the login page. Enter your registered email address and follow the instructions sent to your email to create a new password.",
      category: "Account Management",
    },
    {
      id: "data-export",
      question: "Can I export data from E-Saku?",
      answer:
        "Yes, authorized users can export reports and data from E-Saku in various formats including PDF, Excel, and CSV. This feature is available in the Reports section of your dashboard.",
      category: "Features",
    },
  ];

  const policyItems: PolicyItemData[] = [
    {
      id: "info-collect",
      title: "Information We Collect",
      content:
        "E-Saku collects personal information such as names, contact details, academic records, and behavioral notes. This information is provided by schools, teachers, parents, and students and is used solely for educational management purposes.",
      icon: <Book size={20} />,
    },
    {
      id: "info-usage",
      title: "How We Use Your Information",
      content:
        "We use your information to provide and improve the E-Saku platform services. This includes personalizing your experience, communicating with you about your account, and ensuring the platform meets your needs.",
      icon: <CircleHelp size={20} />,
    },
    {
      id: "data-security",
      title: "Data Security",
      content:
        "We implement a variety of security measures to maintain the safety of your personal information. All data is encrypted both in transit and at rest. We regularly perform security audits and update our systems to prevent unauthorized access.",
      icon: <Shield size={20} />,
    },
    {
      id: "data-retention",
      title: "Data Retention",
      content:
        "We retain personal information only for as long as necessary to fulfill the purposes for which it was collected. Academic records may be maintained for longer periods as required by educational regulations and with appropriate safeguards.",
      icon: <Book size={20} />,
    },
  ];

  const filteredFaqItems = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-14 h-14 border-4 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto  sm:px-6 md:px-8">
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 mb-8 shadow-sm text-left">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">
          Help Center
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mb-6">
          Find answers to common questions about E-Saku, learn about our privacy
          policies, and discover how to make the most of our platform.
        </p>

        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for answers..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <nav
            className="flex border-b border-gray-200 overflow-x-auto"
            ref={tabsRef}
          >
            <button
              ref={tabRefs.faq}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === "faq"
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("faq")}
            >
              Frequently Asked Questions
            </button>
            <button
              ref={tabRefs.policy}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === "policy"
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("policy")}
            >
              Privacy Policy
            </button>
            <button
              ref={tabRefs.contact}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === "contact"
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("contact")}
            >
              Contact Support
            </button>

            <div
              className="absolute bottom-0 h-0.5 bg-green-500 transition-all duration-300 ease-in-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          </nav>
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === "faq" && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Find answers to the most common questions about E-Saku
              </p>
            </div>

            {searchTerm && (
              <p className="mb-4 text-sm text-gray-500">
                {filteredFaqItems.length} results found for "{searchTerm}"
              </p>
            )}

            {filteredFaqItems.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqItems.map((item) => (
                  <FAQItem
                    key={item.id}
                    question={item.question}
                    answer={item.answer}
                    icon={item.icon}
                    category={item.category}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn't find any FAQs matching your search. Try different
                  keywords or contact our support team.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "policy" && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">
                Privacy & Data Policy
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Learn how we handle your information and protect your privacy
              </p>
            </div>

            <div className="space-y-4">
              {policyItems.map((item) => (
                <PolicyItem
                  key={item.id}
                  title={item.title}
                  content={item.content}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">
                Contact Support
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Get in touch with our support team for personalized assistance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ContactCard
                title="Email Support"
                description="Kirimkan email kepada kami, dan tim akan membalas dalam waktu 24 jam. Dukungan tersedia Senin hingga Jumat."
                icon={<Mail size={20} />}
                actionText="Hubungi via Email"
                actionUrl="https://mail.google.com/mail/?view=cm&fs=1&to=exitoidbali@gmail.com"
              />

              <ContactCard
                title="WhatsApp Support"
                description="Untuk bantuan cepat, hubungi kami melalui WhatsApp selama jam kerja (09.00 - 17.00 WITA)."
                icon={<Phone size={20} />}
                actionText="Chat via WhatsApp"
                actionUrl="https://wa.me/6283115454057"
              />

              <ContactCard
                title="Knowledge Base"
                description="Browse our extensive collection of guides, tutorials and troubleshooting articles."
                icon={<Book size={20} />}
                actionText="Visit Knowledge Base"
                actionUrl="#knowledge-base"
              />

              <ContactCard
                title="Feature Requests"
                description="Have an idea to improve E-Saku? Submit your feature requests and feedback."
                icon={<HelpCircle size={20} />}
                actionText="Submit Request"
                actionUrl="#feature-request"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewHelpPreview;
