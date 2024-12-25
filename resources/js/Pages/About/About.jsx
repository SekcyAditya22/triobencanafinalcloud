import React, { useRef, useEffect } from "react";
import { Head } from '@inertiajs/react';
import gsap from "gsap";
import Navbargabungan from "@/Components/Navbargabungan";
import Footergabungan from "@/Components/Footergabungan";
import FloatingChat from '@/Components/FloatingChat';


const About = ({ auth }) => {
    const h1Refs = useRef([]);
    const h2Refs = useRef([]);
    const imageRefs = useRef([]);
    const cloudComputingRefs = useRef([]);
    const cloudComputingHeaderRef = useRef(null);

    const teamMembers = [
        {
            nim: "22.83.0885",
            name: "Muhammad Aditya Madjid",
            kelas: "Teknik Komputer - 02",
            img: "/assets/adit.jpg"
        },
        {
            nim: "22.83.0883",
            name: "Muzakir M Nur",
            kelas: "Teknik Komputer - 02",
            img: "/assets/muza.jpg"
        },
        {
            nim: "22.83.0831",
            name: "Gibran Hait Sami",
            kelas: "Teknik Komputer - 02",
            img: "/assets/gibran.jpg"
        }
    ];

    useEffect(() => {
        const tl = gsap.timeline();
        
        h1Refs.current.forEach((h1, index) => {
            tl.from(h1, {
                x: "-100%",
                delay: 0.8 - index * 0.2,
                opacity: 0,
                duration: 2,
                ease: "Power3.easeOut",
            }, "<");
        });

        h2Refs.current.forEach((h2, index) => {
            tl.from(h2, {
                x: "-100%",
                delay: 0.5 - index * 0.2,
                opacity: 0,
                duration: 2,
                ease: "Power3.easeOut",
            }, "<");
        });

        imageRefs.current.forEach((img, index) => {
            tl.from(img, {
                x: "200%",
                delay: 0.5 - index * 0.2,
                opacity: 0,
                duration: 2,
                ease: "Power3.easeOut",
            }, "<");
        });

        cloudComputingRefs.current.forEach((cloudComputing, index) => {
            tl.from(cloudComputing, {
                y: "-100%",
                delay: 0.5 - index * 0.2,
                opacity: 0,
                duration: 2,
                ease: "Power3.easeOut",
            }, "<");
        });

        tl.from(cloudComputingHeaderRef.current, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "Power3.easeOut"
        }, "-=1");

        gsap.to(".moving-gradient", {
            backgroundPosition: "200% center",
            duration: 10,
            repeat: -1,
            ease: "none"
        });

        gsap.to(".moving-nim", {
            opacity: 1,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }, []);

    return (
        <>
            <Head title="About" />
            <Navbargabungan auth={auth} />
            
            <main className="container pt-40 pb-20 mx-auto max-width">
                <h2 
                    ref={cloudComputingHeaderRef}
                    className="text-xl font-bold text-center text-dark-heading dark:text-light-heading md:text-3xl xl:text-4xl xl:leading-tight about-text moving-gradient"
                    style={{
                        backgroundImage: "linear-gradient(45deg, #00ff00, #FFA500, #00ff00, #00ff00)",
                        backgroundSize: "300%",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}
                >
                    Created By
                    <br></br>
                    <br></br>
                    <br></br>
                </h2>

                {teamMembers.map((member, index) => (
                    <div key={index} className="items-center justify-between mb-20 md:flex">
                        <div className="flex flex-col items-start">
                            <h1
                                ref={(el) => (h1Refs.current[index] = el)}
                                className="mb-4 text-2xl font-bold text-dark-heading dark:text-light-heading md:text-4xl xl:text-5xl xl:leading-tight"
                            >
                                <span className="text-gray-600 moving-nim">{member.nim}</span>
                            </h1>
                            <div className="flex flex-col items-start">
                                <span
                                    ref={(el) => (h2Refs.current[index] = el)}
                                    className="mr-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient md:text-4xl xl:text-5xl xl:leading-tight moving-gradient"
                                    style={{
                                        backgroundImage: "linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff, #00ffff)",
                                        backgroundSize: "300% 300%",
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    {member.name}
                                </span>
                                <span
                                    ref={(el) => (cloudComputingRefs.current[index] = el)}
                                    className="mt-2 text-lg text-dark-heading dark:text-light-heading md:text-xl xl:text-2xl"
                                >
                                    {member.kelas}
                                </span>
                            </div>
                        </div>
                        <div className="mt-5 md:mt-0">
                            <img 
                                ref={(el) => (imageRefs.current[index] = el)} 
                                className="w-1/2 md:ml-auto" 
                                src={member.img} 
                                alt={member.name}
                            />
                        </div>
                    </div>
                ))}
            </main>

            <Footergabungan />
            <FloatingChat auth={auth} />
            <style jsx>{`
                @keyframes gradientMove {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                .moving-gradient {
                    animation: gradientMove 10s linear infinite;
                }
                .max-width {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }
            `}</style>
        </>
    );
};

export default About;
