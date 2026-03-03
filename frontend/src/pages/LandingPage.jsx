import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Database, Zap, Shield, Cpu, ArrowRight, FileText, Layers, Server, MessageSquare, Network, Github, Menu, X } from 'lucide-react';


const ACCORDION_DATA = [
    { title: "What is Modular RAG?", content: "Modular RAG is an enterprise-grade retrieval-augmented generation architecture that connects your organization's knowledge directly to a secure, private LLM." },
    { title: "How does it handle Salesforce data?", content: "Using our proprietary connectors, it securely indexes your Salesforce records, respecting all existing role-based access controls and permissions." },
    { title: "Is the data secure?", content: "Yes. All processing is done completely within your isolated environment. Your proprietary data is never used to train external public models." },
    { title: "Can I customize the LLM?", content: "Absolutely. The modular architecture allows swapping out the backend engine, from local open-source models to managed enterprise tier APIs." }
];

const CHART_DATA = [
    { name: 'Week 1', 'Standard LLM Exactness': 40, 'Modular RAG Accuracy': 85 },
    { name: 'Week 2', 'Standard LLM Exactness': 42, 'Modular RAG Accuracy': 88 },
    { name: 'Week 3', 'Standard LLM Exactness': 41, 'Modular RAG Accuracy': 92 },
    { name: 'Week 4', 'Standard LLM Exactness': 45, 'Modular RAG Accuracy': 95 },
    { name: 'Week 5', 'Standard LLM Exactness': 44, 'Modular RAG Accuracy': 98 },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [openAccordion, setOpenAccordion] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Simulate initial page load
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    // Close mobile menu on route changes / resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Layer */}
            <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 md:h-18">
                        {/* Logo */}
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg border border-indigo-400/30 group-hover:shadow-indigo-500/25 transition-all">
                                <Cpu className="text-white" size={20} />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white">Modular RAG</span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-3">
                            <a
                                href="https://github.com/muhaddasgujjar/modular-rag"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                title="View on GitHub"
                            >
                                <Github size={20} />
                            </a>
                            <Link
                                to="/chat"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 hover:-translate-y-0.5 transition-all shadow-md shadow-indigo-500/25 border border-indigo-500/50 group"
                            >
                                Launch Architect <ArrowRight size={16} className="text-indigo-200 group-hover:text-white transition-colors group-hover:translate-x-0.5" />
                            </Link>
                        </div>

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="md:hidden overflow-hidden bg-[#020617] border-t border-slate-800/80"
                        >
                            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
                                <a
                                    href="https://github.com/muhaddasgujjar/modular-rag"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm border border-slate-800"
                                >
                                    <Github size={18} /> View on GitHub
                                </a>
                                <Link
                                    to="/chat"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/25 border border-indigo-500/50"
                                >
                                    Launch Architect <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-[100svh] flex items-center pt-32 pb-12 overflow-hidden">
                {/* Indigo/Purple Glowing Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
                <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center relative z-10 gap-16 lg:gap-0">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.4 }}
                        className="w-full lg:w-1/2 pt-12 lg:pt-0 text-center lg:text-left flex flex-col items-center lg:items-start"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 uppercase tracking-wider backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                            <Zap size={14} className="text-indigo-400" /> Next-Gen Architecture
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                            Enterprise AI, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">Built on Truth.</span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                            Stop hallucinating. Start executing. Our Modular Retrieval-Augmented Generation ecosystem grounds every response in your actual secure Enterprise data.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <Link
                                to="/chat"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 text-white font-medium text-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1"
                            >
                                Start Chat Session <ArrowRight size={20} />
                            </Link>
                            {/* New Download Guide Button */}
                            <a
                                href="/salesforce_apex_developer_guide.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-medium text-lg hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:-translate-y-1 transition-all group shadow-[0_0_20px_rgba(79,70,229,0.05)]"
                            >
                                <FileText size={20} className="text-indigo-400 group-hover:text-indigo-300" /> Download PDF Guide
                            </a>
                            <a
                                href="https://github.com/muhaddasgujjar/modular-rag"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#1e293b] hover:bg-slate-800 border border-slate-700 text-white font-medium text-lg transition-all shadow-lg shadow-slate-900/50 hover:-translate-y-1"
                            >
                                <Github size={20} className="text-slate-300" /> View on GitHub
                            </a>
                        </div>
                    </motion.div>

                    {/* Floating 3D Graphic */}
                    <div className="w-full lg:w-1/2 h-[350px] sm:h-[400px] lg:h-[600px] relative" style={{ perspective: '1200px' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 1.6 }}
                            className="absolute inset-0 flex items-center justify-center transform-style-3d scale-75 sm:scale-90 lg:scale-100"
                        >
                            {/* Layer 1: Query */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="absolute top-[10%] lg:top-[20%] right-[0%] lg:right-[10%] w-[280px] sm:w-[320px] bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-slate-700/50 z-30"
                                style={{ transform: 'rotateX(20deg) rotateY(-20deg)' }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">User Query <Zap size={14} className="text-yellow-400" /></h3>
                                        <p className="text-slate-400 text-xs">Processing natural language...</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-indigo-500 rounded-full w-2/3 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                </div>
                            </motion.div>

                            {/* Layer 2: Vector DB */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                                className="absolute top-[40%] left-[-5%] sm:left-[5%] lg:left-[10%] w-[300px] sm:w-[340px] bg-[#1e293b]/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-indigo-500/20 z-20"
                                style={{ transform: 'rotateX(20deg) rotateY(-20deg) translateZ(-50px)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                        <Database size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-left text-sm sm:text-base">ChromaDB Vector Store</h3>
                                        <p className="text-indigo-300/80 text-xs text-left">Retrieving from 2,341 semantic chunks</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Layer 3: LLM */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
                                className="absolute top-[70%] lg:top-[65%] right-[5%] lg:right-[15%] w-[260px] sm:w-[300px] bg-[#020617]/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-purple-500/30 z-10 relative overflow-hidden group"
                                style={{ transform: 'rotateX(20deg) rotateY(-20deg) translateZ(-100px)' }}
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-600/10 to-transparent"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30">
                                        <Cpu size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-left text-sm sm:text-base">LLM Inference</h3>
                                        <p className="text-purple-300/80 text-xs text-left cursor-default">Synthesizing grounded response</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Architecture Details Section */}
            <section className="py-20 lg:py-32 bg-[#020617] relative border-t border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16 lg:mb-24"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">How it works behind the scenes</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">A powerful pipeline transforming your raw PDFs into a highly accurate Semantic knowledge base.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {/* Connecting line hidden on non-lg screens */}
                        <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-px bg-slate-800 -z-10"></div>

                        {[
                            { icon: FileText, title: "1. Data Extraction", desc: "Parsed the 43-page Salesforce Developer PDF document, stripping noisy formatting using Unstructured.", details: "1 PDF document" },
                            { icon: Layers, title: "2. NLP Chunking", desc: "LangChain's RecursiveCharacterTextSplitter split the text to preserve complete sentences and logic.", details: "Chunk size 1000, overlap 200" },
                            { icon: Database, title: "3. Vector DB", desc: "Generated high-dimensional mathematical embeddings to map semantic meaning.", details: "2,341 Chunks in ChromaDB" },
                            { icon: Server, title: "4. LLM Generation", desc: "The Llama-3-70B model safely synthesizes answers purely from the retrieved K-nearest neighbors.", details: "Groq Cloud API" },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className={`bg-[#0f172a] rounded-2xl p-6 sm:p-8 border border-slate-800 text-center transition-all hover:bg-[#1e293b] hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] group`}
                            >
                                <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-6 bg-slate-800 border border-slate-700 text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all duration-300 shadow-sm`}>
                                    <step.icon size={26} />
                                </div>
                                <h3 className="text-lg lg:text-xl font-bold mb-3 text-white">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-5">{step.desc}</p>
                                <div className="inline-block px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/80 text-xs font-semibold text-indigo-300">
                                    {step.details}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Details Grid */}
            <section className="py-20 lg:py-32 bg-[#0f172a] relative border-t border-slate-800/50">
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent top-0"></div>
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16 lg:mb-24"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">Why Modular RAG over standard LLMs?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">We engineered completely autonomous, context-aware guards that wrap around standard foundational models.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-[#1e293b] rounded-2xl p-8 border border-slate-700 hover:border-indigo-500/50 transition-colors shadow-lg shadow-slate-900/50 group"
                        >
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Database size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Truth-Grounded</h3>
                            <p className="text-slate-400 leading-relaxed text-sm lg:text-base">Direct integration with your 2,341 proprietary chunk segments. The model only speaks when it has citations to prove its point.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-[#1e293b] rounded-2xl p-8 border border-slate-700 hover:border-purple-500/50 transition-colors shadow-lg shadow-slate-900/50 group"
                        >
                            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Semantic Guardrails</h3>
                            <p className="text-slate-400 leading-relaxed text-sm lg:text-base">Strict organizational policies are enforced via SemanticRouter. If a user asks a restricted query, the router blocks the LLM entirely before inference.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-[#1e293b] rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition-colors shadow-lg shadow-slate-900/50 group"
                        >
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Async Performance</h3>
                            <p className="text-slate-400 leading-relaxed text-sm lg:text-base">Highly concurrent FastAPI architecture utilizing asyncio ensures fast streaming responses scaling up to thousands of users simultaneously.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-20 lg:py-32 bg-[#020617] border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">Built on a Battle-Tested Stack</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">Every component is chosen for speed, safety, and enterprise-grade reliability.</p>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
                        {/* Terminal Code Block */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="w-full lg:w-1/2 bg-[#0b1120] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl shadow-black/60"
                        >
                            {/* Terminal header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#111827] border-b border-slate-800">
                                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                                <span className="ml-3 text-xs text-slate-500 font-mono">rag_pipeline.py</span>
                            </div>
                            {/* Code */}
                            <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
                                <div><span className="text-slate-500"># 1. Semantic Router — classify incoming query</span></div>
                                <div className="mt-2"><span className="text-purple-400">route</span> <span className="text-slate-300">= await</span> <span className="text-indigo-400">semantic_router</span><span className="text-slate-300">.</span><span className="text-yellow-300">aclassify</span><span className="text-slate-300">(query)</span></div>
                                <div className="mt-3"><span className="text-slate-500"># 2. Retrieve top-k chunks from ChromaDB</span></div>
                                <div className="mt-2"><span className="text-purple-400">docs</span> <span className="text-slate-300">= await</span> <span className="text-indigo-400">vector_store</span><span className="text-slate-300">.</span><span className="text-yellow-300">asimilarity_search</span><span className="text-slate-300">(query, k=</span><span className="text-emerald-400">6</span><span className="text-slate-300">)</span></div>
                                <div className="mt-3"><span className="text-slate-500"># 3. Build grounded context from retrieved docs</span></div>
                                <div className="mt-2"><span className="text-purple-400">context</span> <span className="text-slate-300">= </span><span className="text-yellow-300">"</span><span className="text-orange-300">\n\n</span><span className="text-yellow-300">"</span><span className="text-slate-300">.</span><span className="text-yellow-300">join</span><span className="text-slate-300">(d.page_content </span><span className="text-purple-400">for</span><span className="text-slate-300"> d </span><span className="text-purple-400">in</span><span className="text-slate-300"> docs)</span></div>
                                <div className="mt-3"><span className="text-slate-500"># 4. LLM synthesis via Groq — llama-3.3-70b</span></div>
                                <div className="mt-2"><span className="text-purple-400">reply</span> <span className="text-slate-300">= await</span> <span className="text-indigo-400">llm</span><span className="text-slate-300">.</span><span className="text-yellow-300">ainvoke</span><span className="text-slate-300">(prompt.format(</span></div>
                                <div className="mt-1 pl-6"><span className="text-slate-300">context=context, question=query))</span></div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-2 h-4 bg-indigo-400 animate-pulse rounded-sm"></div>
                                    <span className="text-indigo-400 text-xs">Ready</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tech Cards Grid */}
                        <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                {
                                    name: 'Groq + Llama 3.3',
                                    role: 'LLM Inference Engine',
                                    desc: 'Ultra-fast token synthesis at 900+ tokens/sec. Zero hallucinations — grounded strictly in retrieved context.',
                                    badge: 'llama-3.3-70b',
                                    color: 'from-indigo-500 to-purple-600',
                                    glow: 'group-hover:shadow-indigo-500/20',
                                    border: 'group-hover:border-indigo-500/50',
                                    icon: Cpu,
                                },
                                {
                                    name: 'ChromaDB',
                                    role: 'Vector Store',
                                    desc: '2,341 semantic chunks stored as high-dimensional embeddings for sub-millisecond similarity retrieval.',
                                    badge: '2,341 chunks',
                                    color: 'from-emerald-500 to-teal-600',
                                    glow: 'group-hover:shadow-emerald-500/20',
                                    border: 'group-hover:border-emerald-500/50',
                                    icon: Database,
                                },
                                {
                                    name: 'FastAPI',
                                    role: 'Async REST Backend',
                                    desc: 'Fully async API with per-session memory, concurrent request handling, and strict input guardrails.',
                                    badge: 'asyncio + uvicorn',
                                    color: 'from-sky-500 to-blue-600',
                                    glow: 'group-hover:shadow-sky-500/20',
                                    border: 'group-hover:border-sky-500/50',
                                    icon: Server,
                                },
                                {
                                    name: 'LangChain',
                                    role: 'Orchestration Layer',
                                    desc: 'Semantic router classifies queries, RecursiveCharacterTextSplitter chunks PDFs with 200-token overlap.',
                                    badge: 'SemanticRouter',
                                    color: 'from-amber-500 to-orange-600',
                                    glow: 'group-hover:shadow-amber-500/20',
                                    border: 'group-hover:border-amber-500/50',
                                    icon: Network,
                                },
                            ].map((tech, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className={`group bg-[#0f172a] rounded-2xl p-5 border border-slate-800 ${tech.border} transition-all duration-300 hover:shadow-xl ${tech.glow} hover:-translate-y-1 cursor-default`}
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                                        <tech.icon size={20} />
                                    </div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">{tech.name}</h3>
                                    <p className="text-slate-500 text-xs mb-3">{tech.role}</p>
                                    <p className="text-slate-400 text-xs leading-relaxed mb-4">{tech.desc}</p>
                                    <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-mono font-semibold text-slate-400">{tech.badge}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Accordion FAQ Section */}
            <section className="py-20 lg:py-32 bg-[#0f172a] relative border-t border-slate-800/50">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 lg:mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">Frequently Asked Questions</h2>
                    </motion.div>

                    <div className="space-y-4">
                        {ACCORDION_DATA.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="border border-slate-800 rounded-2xl overflow-hidden bg-[#1e293b] hover:border-slate-700 transition-colors shadow-sm"
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full flex justify-between items-center p-5 lg:p-6 text-left focus:outline-none"
                                >
                                    <span className="font-semibold text-slate-200 text-sm sm:text-base pr-4">{item.title}</span>
                                    {openAccordion === index ? (
                                        <ChevronUp className="text-indigo-400 shrink-0" size={20} />
                                    ) : (
                                        <ChevronDown className="text-slate-500 hover:text-indigo-400 shrink-0 transition-colors" size={20} />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {openAccordion === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden bg-[#020617] border-t border-slate-800/80"
                                        >
                                            <div className="p-5 lg:p-6 text-slate-400 leading-relaxed text-sm sm:text-base">
                                                {item.content}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#020617] py-16 text-center text-slate-500 text-sm border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                    <a href="https://github.com/muhaddasgujjar/modular-rag" target="_blank" rel="noopener noreferrer" className="mb-6 text-indigo-500/50 hover:text-indigo-400 transition-colors">
                        <Github size={28} />
                    </a>
                    <p className="mb-2 font-medium tracking-wider text-slate-400 uppercase text-xs">Modular RAG Architecture</p>
                    <p className="opacity-60 mb-6 text-slate-400">Built to connect secure data to intelligence.</p>
                    <div className="p-px bg-gradient-to-r from-transparent via-slate-800 to-transparent w-full max-w-sm mb-6"></div>
                    <p className="opacity-80 text-xs text-slate-500">&copy; {new Date().getFullYear()} <span className="text-indigo-300 ml-1 font-medium">Muhammad Muhaddas</span></p>
                </div>
            </footer>
        </div>
    );
}
