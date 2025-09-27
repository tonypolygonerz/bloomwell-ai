'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel your subscription at any time with no penalties. Your access continues until the end of your current billing period, and you can export all your project data. We believe in earning your business every month.',
  },
  {
    question: 'Do I need a credit card for the free trial?',
    answer:
      "No credit card required for your 14-day free trial. Simply sign up with your email address and start exploring all of Bloomwell AI's features immediately. You'll only be asked for payment information if you decide to continue after your trial.",
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      "Your data is always yours. When you cancel, you can export all your grant research, project notes, and conversation history. We'll keep your data accessible for 30 days after cancellation, then permanently delete it unless you request earlier deletion.",
  },
  {
    question: 'Can multiple team members share one account?',
    answer:
      "Currently, Bloomwell AI is designed for individual users. Each team member needs their own account to ensure personalized AI assistance and project organization. We're working on team accounts for future releases.",
  },
  {
    question: 'Is there a discount for multiple users?',
    answer:
      "We don't currently offer volume discounts, but our $24.99/month pricing is already significantly less expensive than traditional consulting services. Contact us if you're interested in team licensing options for larger organizations.",
  },
  {
    question: 'How does the 14-day trial work?',
    answer:
      'Your trial gives you full access to all Bloomwell AI features for 14 days. You can search grants, chat with our AI assistant, attend webinars, and organize projects. No limitations or watermarks - just the complete experience to help you make an informed decision.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First FAQ open by default

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='text-center'>
      <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
        Frequently Asked Questions
      </h2>
      <p className='text-xl text-gray-600 mb-12 max-w-2xl mx-auto'>
        Everything you need to know about Bloomwell AI&apos;s pricing and policies
      </p>

      <div className='max-w-3xl mx-auto'>
        {faqs.map((faq, index) => (
          <div key={index} className='mb-4'>
            <button
              onClick={() => toggleFAQ(index)}
              className='w-full text-left bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900 pr-4'>
                  {faq.question}
                </h3>
                <svg
                  className={`w-6 h-6 text-gray-500 transform transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </button>

            <div
              id={`faq-answer-${index}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className='bg-gray-50 rounded-b-xl px-6 pb-6 pt-2'>
                <p className='text-gray-700 leading-relaxed'>{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8'>
        <h3 className='text-xl font-semibold text-gray-900 mb-4'>
          Still have questions?
        </h3>
        <p className='text-gray-600 mb-6'>
          Our nonprofit support team is here to help you succeed.
        </p>
        <a
          href='mailto:support@bloomwell-ai.com'
          className='inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors'
        >
          Contact Support
          <svg
            className='ml-2 w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
