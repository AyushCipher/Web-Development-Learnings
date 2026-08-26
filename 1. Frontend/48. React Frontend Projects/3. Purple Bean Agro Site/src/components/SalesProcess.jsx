import { motion } from 'framer-motion';
import {
  Mail,
  ClipboardCheck,
  PackageCheck,
  Truck,
} from 'lucide-react';

const steps = [
  {
    icon: Mail,
    title: 'Inquiry & Sample Dispatch',
    description:
      'You reach out to us with your requirements. We ship free or paid samples based on your needs.',
  },
  {
    icon: ClipboardCheck,
    title: 'Product Finalization & Quotation',
    description:
      'After feedback, we finalize your specifications and submit a competitive quotation.',
  },
  {
    icon: PackageCheck,
    title: 'Order Confirmation & Production',
    description:
      'Once PO or advance is received, your batch goes into production — typically within 7–14 days.',
  },
  {
    icon: Truck,
    title: 'Dispatch & Documentation',
    description:
      'We handle packing, labelling, customs clearance, and dispatch — whether domestic or export.',
  },
];

const SalesProcess = () => {
  return (
    <section
      className="py-20 bg-white"
      aria-labelledby="sales-process-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            id="sales-process-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            How Our Sales Process Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            From your first inquiry to final delivery, our team ensures a smooth, transparent, and timely experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="bg-primary-100 w-14 h-14 rounded-full flex items-center justify-center mb-5">
                <step.icon className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesProcess;
