import React from "react";

const About = () => {
  return (
    <section className="">
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center ">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">About Us</p>
      </div>
      <div className="mt-8">
        <p className="text-[45px] sm:text-[32px] md:text-[36px] lg:text-[45px] text-center mb-8">
          Fueling Your Adventures with Passion, <br /> and Relentless Outdoor
          Spirit.
        </p>
        <div className="mx-[75px]">
          <img
            src="/About us.png"
            alt="About Us"
            className="w-full md:h-[675px] object-cover rounded-[20px] border"
          />
        </div>
        <div className="mx-auto w-full max-w-[1290px] min-h-[790px] bg-[#8DC53E]/20 rounded-[20px] mt-[30px] px-4 py-6">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0 pt-[30px] md:pt-[70px] md:ml-[70px] md:pr-[70px]">
            {/* Image 1 Container */}
            <div className="flex-shrink-0 w-full md:w-auto">
              <img
                src="/Aboutus 1.png" // Ensure this image is in your client/public folder
                alt="Inception Vision"
                className="w-full max-w-[280px] md:max-w-[545px] h-auto md:h-[305px] object-cover rounded-[20px] border mx-auto md:mx-0"
              />
            </div>
            <div className="text-gray-800 w-full md:flex-1 px-2 md:px-0 md:pl-[40px]">
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-center md:text-left">
                Inception Vision:
              </h3>
              <p className="text-sm md:text-base md:text-[18px] leading-relaxed text-center md:text-left">
                Vision Crafters was founded on a collective vision shared among
                seasoned professionals who sought to redefine excellence in the
                construction industry. With decades of experience under their
                belts, our founders established a company that prioritizes
                innovation, integrity, and unwavering dedication to client
                satisfaction. This initial vision served as the driving force
                behind the creation of Vision Crafters, setting the stage for
                the company's remarkable journey.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0 mt-6 md:mt-10 md:ml-[70px] md:pr-[70px] pb-[30px] md:pb-[70px]">
            <div className="text-gray-800 w-full md:flex-1 px-2 md:px-0 md:pr-[40px] order-2 md:order-1">
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-center md:text-left">
                Our Commitment:
              </h3>
              <p className="text-sm md:text-base md:text-[18px] leading-relaxed text-center md:text-left">
                At Vision Crafters, we don't just build structures—we build
                trust. From residential homes to commercial complexes, every
                project is handled with the same level of care and
                professionalism. Our growth is a reflection of our unwavering
                commitment to client satisfaction, ethical practices, and a deep
                respect for craftsmanship.
              </p>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto order-1 md:order-2">
              <img
                src="/Aboutus 2.png" // Ensure this image is in your client/public folder
                alt="Our Commitment"
                className="w-full max-w-[280px] md:max-w-[545px] h-auto md:h-[305px] object-cover rounded-[20px] border mx-auto md:mx-0"
              />
            </div>
          </div>
        </div>
        {/* Customer Reviews Section - Fixed for proper row display on desktop */}
        <div className="w-full mt-[30px] mb-[30px] bg-[url('/Review-BG.png')] bg-no-repeat bg-center bg-cover">
          <p className="text-[40px] text-[#FFA81D] text-center mt-[10px] pt-[80px] font-bold">
            CUSTOMER SAYS
          </p>

          {/* FIRST ROW - 3 REVIEWS */}
          <div className="flex justify-between items-stretch px-[100px] py-[25px] gap-x-[30px] text-center">
            {/* REVIEW 1 */}
            <div className="text-[#ffffff] w-1/3 flex-shrink-0 min-h-full">
              <img
                src="/AK.jpg"
                alt=""
                className="h-[105px] w-[105px] mx-auto rounded-full border-[5px] hover:border-[#FFA81D] transition"
              />
              <p className="text-[25px] mb-[5px] font-bold">Ajith Kumar</p>
              <p className="text-[20px]">CAR RACER</p>
              <div className="flex mt-[20px] justify-center">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="w-[18px] h-[18px] text-[#FFA81D] mr-[2px]"
                      fill="#FFA81D"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                    </svg>
                  ))}
              </div>
              <p className="text-[15px] leading-[2.2] text-[#D9D7D7] mt-3">
                "Absolutely thrilled with the quality!" <br />
                I bought my hiking gear from here for a trip <br />
                through the Knuckles Range—everything held <br />
                up beautifully. Lightweight, durable, and weatherproof.
              </p>
            </div>

            {/* REVIEW 2 */}
            <div className="text-[#ffffff] w-1/3 flex-shrink-0 min-h-full">
              <img
                src="/prabhas.jpg"
                alt=""
                className="h-[105px] w-[105px] mx-auto rounded-full border-[5px] hover:border-[#FFA81D] transition"
              />
              <p className="text-[25px] mb-[5px] font-bold">Prabhas</p>
              <p className="text-[20px]">ACTOR</p>
              <div className="flex mt-[20px] justify-center">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="w-[18px] h-[18px] text-[#FFA81D] mr-[2px]"
                      fill="#FFA81D"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                    </svg>
                  ))}
              </div>
              <p className="text-[15px] leading-[2.2] text-[#D9D7D7] mt-3">
                "Fast delivery & top-notch customer service." <br />
                Ordered last-minute before a weekend trek and my package <br />
                arrived early! Plus, the team was super responsive when <br />I
                had questions. Will definitely shop again!
              </p>
            </div>

            {/* REVIEW 3 */}
            <div className="text-[#ffffff] w-1/3 flex-shrink-0 min-h-full">
              <img
                src="/vijay.png"
                alt=""
                className="h-[105px] w-[105px] mx-auto rounded-full border-[5px] hover:border-[#FFA81D] transition"
              />
              <p className="text-[25px] mb-[5px] font-bold">Joseph Vijay</p>
              <p className="text-[20px]">POLITICIAN</p>
              <div className="flex mt-[20px] justify-center">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="w-[18px] h-[18px] text-[#FFA81D] mr-[2px]"
                      fill="#FFA81D"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                    </svg>
                  ))}
              </div>
              <p className="text-[15px] leading-[2.2] text-[#D9D7D7] mt-3">
                "More than gear—this is adventure made easy." <br />
                From browsing to checkout, the whole experience felt tailored{" "}
                <br />
                for explorers like me. Everything I ordered was just as <br />
                described and made my trip smooth and unforgettable.
              </p>
            </div>
          </div>

          {/* SECOND ROW - 3 MORE REVIEWS */}
          <div className="flex justify-between items-stretch px-[100px] py-[25px] gap-x-[30px] text-center">
            {/* REVIEW 4 */}
            <div className="text-[#ffffff] w-1/3 flex-shrink-0 min-h-full">
              <img
                src="/rajini.jpg"
                alt=""
                className="h-[105px] w-[105px] mx-auto rounded-full border-[5px] hover:border-[#FFA81D] transition"
              />
              <p className="text-[25px] mb-[5px] font-bold">Rajinikanth</p>
              <p className="text-[20px]">SUPERSTAR</p>
              <div className="flex mt-[20px] justify-center">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="w-[18px] h-[18px] text-[#FFA81D] mr-[2px]"
                      fill="#FFA81D"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                    </svg>
                  ))}
              </div>
              <p className="text-[15px] leading-[2.2] text-[#D9D7D7] mt-3">
                "Style meets functionality perfectly!" <br />
                These adventure gears are not just practical but <br />
                look amazing too! Perfect for my outdoor shoots <br />
                and personal adventures. Highly recommended!
              </p>
            </div>

            {/* REVIEW 5 */}
            <div className="text-[#ffffff] w-1/3 flex-shrink-0 min-h-full">
              <img
                src="/mahesh.jpg"
                alt=""
                className="h-[105px] w-[105px] mx-auto rounded-full border-[5px] hover:border-[#FFA81D] transition"
              />
              <p className="text-[25px] mb-[5px] font-bold">Mahesh Babu</p>
              <p className="text-[20px]">ACTOR</p>
              <div className="flex mt-[20px] justify-center">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="w-[18px] h-[18px] text-[#FFA81D] mr-[2px]"
                      fill="#FFA81D"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                    </svg>
                  ))}
              </div>
              <p className="text-[15px] leading-[2.2] text-[#D9D7D7] mt-3">
                "Premium quality at reasonable prices!" <br />
                Used these products during my fitness training <br />
                and outdoor activities. The durability is exceptional <br />
                and worth every penny spent. Great value for money!
              </p>
            </div>

            {/* REVIEW 6 */}
            <div className="text-[#ffffff] w-1/3 flex-shrink-0 min-h-full">
              <img
                src="/allu.jpg"
                alt=""
                className="h-[105px] w-[105px] mx-auto rounded-full border-[5px] hover:border-[#FFA81D] transition"
              />
              <p className="text-[25px] mb-[5px] font-bold">Allu Arjun</p>
              <p className="text-[20px]">ACTOR</p>
              <div className="flex mt-[20px] justify-center">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="w-[18px] h-[18px] text-[#FFA81D] mr-[2px]"
                      fill="#FFA81D"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                    </svg>
                  ))}
              </div>
              <p className="text-[15px] leading-[2.2] text-[#D9D7D7] mt-3">
                "Innovation and comfort combined!" <br />
                These adventure products are perfectly designed <br />
                for active lifestyles. Whether it's for dance practice <br />
                or outdoor adventures, they never disappoint!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
