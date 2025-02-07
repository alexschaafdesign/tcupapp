import React from 'react';

const TCUPNewsletter = () => {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-12 bg-white">
      {/* TCUP Header */}
      <div>
        <img 
          src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1738937082/Screenshot_2025-02-07_at_8.01.09_AM_uwo8fs.png" 
          alt="TCUP Newsletter" 
          className="w-full"
        />
      </div>

      {/* Beatrice Section */}
      <div className="flex gap-6">
        {/* Pink box with illustration */}
        <div className="w-1/2 bg-pink-200 p-4">
          <div className="text-sm mb-4">✨ xo xo ✨</div>
          <div className="font-bold">"pull quote"</div>
          <img 
            src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1738937103/Screenshot_2025-02-07_at_8.04.55_AM_pynp4h.png" 
            alt="Beatrice illustration" 
            className="mt-4"
          />
        </div>
        {/* Text section */}
        <div className="w-1/2">
          <p className="text-lg">
            Beatrice - intro Beatrice - intro Beatrice - intro 
            Beatrice - intro Beatrice - intro Beatrice - intro 
            Beatrice - intro Beatrice - intro Beatrice - intro 
            Beatrice - intro Beatrice - intro
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="text-center">
        <p>
          FAQ - Beatrice - done - FAQ - Beatrice - done -
          FAQ - Beatrice - done FAQ - Beatrice - done -
          FAQ - Beatrice - done - FAQ - Beatrice - done
        </p>
      </div>

      {/* Person Photo and Question Section */}
      <div className="flex gap-6">
        <div className="w-1/2">
          <img 
            src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1738937116/Screenshot_2025-02-07_at_8.05.11_AM_ccx8dv.png" 
            alt="Person in red shirt" 
            className="w-full"
          />
        </div>
        <div className="w-1/2 space-y-4">
          <div className="bg-green-100 p-4">
            <p>the CUPBOARD:</p>
            <p>What advice would you give young Laura, just starting out in music?</p>
          </div>
          <img 
            src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1738937130/Screenshot_2025-02-07_at_8.05.23_AM_bfhgvg.png" 
            alt="Group photo" 
            className="w-full"
          />
        </div>
      </div>

      {/* Layout Notes */}
      <div className="space-y-4">
        <p>MEMBER PROFILE - done</p>
        <p>LAYOUT NOTE</p>
        <p>
          Formatting in google docs doesn't seem to allow me to put
          that (image on the left) on the right side of the page.
        </p>
        <p>
          But I'm hoping the "Every Action" interface will allow me to
          wrap text on the opposite side of the page. Then there can
          be a "back and forth kind of visual vibe.
        </p>
        <p>
          I'll copy a little bit of band bio verbiage here & say some
          stuff that rules about Laura.
        </p>
      </div>

      {/* Other sections can be added here */}
      <div className="text-center">
        <p>KEEPING UP WITH TCUP - Dante - done</p>
        <img 
          src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1738937145/Screenshot_2025-02-07_at_8.05.40_AM_odci0g.png" 
          alt="Dante performance" 
          className="w-full my-4"
        />
        <p>Dante's Condensed stuff.</p>
        <p>What should be here from dante's section?</p>
        <p>Anyone have any thoughts?</p>
      </div>

      {/* Valentine's Section */}
      <div className="text-center">
        <p>100?</p>
        <img 
          src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1738937175/Screenshot_2025-02-07_at_8.05.54_AM_xplahr.png" 
          alt="Valentine's message" 
          className="w-full my-4"
        />
        <p>
          Beatrice, wanna make a TCUP valentine's card? Babo? If yes, would you be down to try using
          photos from the <span className="text-blue-600">greenroom event</span>?
        </p>
      </div>

      {/* Footer Logo */}
      <div className="flex justify-center">
        <img 
          src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1735343525/LOGO_512_3x_t11sld.png" 
          alt="TCUP Logo" 
          className="w-24 h-24"
        />
      </div>
    </div>
  );
};

export default TCUPNewsletter;