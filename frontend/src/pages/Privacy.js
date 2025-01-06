import React from 'react';

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Last updated: January 6, 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Data Collection and Usage</h2>
        <p className="mb-4">We collect and display Instagram posts, including:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Photos and videos</li>
          <li>Captions and descriptions</li>
          <li>Post metadata (timestamps, engagement metrics)</li>
          <li>Basic account information</li>
        </ul>
        <p>This data is collected through the Instagram Basic Display API and used solely to display content on TCUPboard.org.</p>
      </section>

      {/* Continue with other sections similarly */}
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Contact</h2>
        <p>For privacy-related inquiries, contact: [Your Contact Information]</p>
      </section>
    </div>
  );
};

export default Privacy;