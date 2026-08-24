"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, Reorder, motion } from "motion/react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Package,
  IndianRupee,
  Boxes,
  Tag,
  FileText,
  RotateCcw,
  ShieldCheck,
  ImagePlus,
  UploadCloud,
  X,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  Ruler,
  Eye,
  Star,
  GripVertical,
  WandSparkles,
  CircleCheck,
  Zap,
  ShoppingBag,
  Layers3,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

/* =========================================================
   CONSTANTS
========================================================= */
const MAX_IMAGES = 4;
const MAX_HIGHLIGHTS = 5;

const categories = [
  {
    value: "Electronics",
    label: "Electronics",
    emoji: "⚡",
    color: "from-blue-500 to-cyan-500",
  },
  {
    value: "Clothing",
    label: "Clothing",
    emoji: "👕",
    color: "from-pink-500 to-rose-500",
  },
  {
    value: "Shoes",
    label: "Shoes",
    emoji: "👟",
    color: "from-orange-500 to-amber-500",
  },
  {
    value: "Beauty",
    label: "Beauty",
    emoji: "✨",
    color: "from-fuchsia-500 to-purple-500",
  },
  {
    value: "Home",
    label: "Home & Kitchen",
    emoji: "🏠",
    color: "from-emerald-500 to-teal-500",
  },
  {
    value: "Books",
    label: "Books",
    emoji: "📚",
    color: "from-violet-500 to-indigo-500",
  },
  {
    value: "Sports",
    label: "Sports",
    emoji: "🏆",
    color: "from-red-500 to-orange-500",
  },
  {
    value: "Grocery",
    label: "Grocery",
    emoji: "🛒",
    color: "from-lime-500 to-green-500",
  },
  {
    value: "Other",
    label: "Other",
    emoji: "➕",
    color: "from-slate-500 to-slate-700",
  },
];

const clothingSizes = [
  ["XS", "Extra Small"],
  ["S", "Small"],
  ["M", "Medium"],
  ["L", "Large"],
  ["XL", "Extra Large"],
  ["XXL", "Double Extra Large"],
  ["XXXL", "Triple Extra Large"],
];

const shoeSizes = ["6", "7", "8", "9", "10", "11", "12", "13"];

/* =========================================================
   SMALL COMPONENTS
========================================================= */
const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  color = "blue",
  badge,
}) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.06 }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${colors[color]}`}
        >
          <Icon size={20} />
        </motion.div>

        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>

      {badge && (
        <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block">
          {badge}
        </span>
      )}
    </div>
  );
};

const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="mt-1.5 pl-2 text-[11px] font-semibold text-red-500"
    >
      {message}
    </motion.p>
  );
};

const FloatingInput = ({
  id,
  icon: Icon,
  label,
  error,
  value,
  registerProps,
  type = "text",
  min,
  step,
}) => {
  return (
    <motion.div
      animate={
        error
          ? {
              x: [0, -3, 3, -2, 2, 0],
            }
          : {}
      }
      transition={{ duration: 0.35 }}
      className="relative"
    >
      <Icon
        size={17}
        className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 ${
          error ? "text-red-400" : "text-slate-400"
        }`}
      />

      <input
        id={id}
        type={type}
        min={min}
        step={step}
        placeholder=" "
        {...registerProps}
        className={`peer h-14 w-full rounded-2xl border bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-300 hover:border-slate-300 hover:bg-white focus:bg-white focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-50"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
      />

      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-11 bg-slate-50 px-1 text-sm text-slate-400 transition-all duration-200 peer-focus:-top-2 peer-focus:bg-white peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-600 ${
          value
            ? "-top-2 bg-white text-[11px] font-bold text-slate-600"
            : "top-1/2 -translate-y-1/2"
        }`}
      >
        {label}
      </label>

      {!error && value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
        >
          <CircleCheck size={17} />
        </motion.div>
      )}

      <FieldError message={error} />
    </motion.div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */
const Page = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      ProductTitle: "",
      Price: "",
      StockQuantity: "",
      Category: "",
      CustomCategory: "",
      Size: "",
      Description: "",
      ReplaceDay: "",
      Warranty: "",
      Point1: "",
      Point2: "",
      Point3: "",
      Point4: "",
      Point5: "",
    },
  });

  const productTitle = watch("ProductTitle");
  const price = watch("Price");
  const stockQuantity = watch("StockQuantity");
  const category = watch("Category");
  const customCategory = watch("CustomCategory");
  const size = watch("Size");
  const description = watch("Description");
  const replaceDay = watch("ReplaceDay");
  const warranty = watch("Warranty");

  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const [highlights, setHighlights] = useState([1]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(true);

  const fileInputRef = useRef(null);

  /* =========================================================
     OBJECT URL CLEANUP
  ========================================================== */
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  /* =========================================================
     MOUSE PARALLAX
  ========================================================== */
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouse({
        x: (event.clientX / window.innerWidth - 0.5) * 20,
        y: (event.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* =========================================================
     IMAGE HANDLING
  ========================================================== */
  const handleImages = (files) => {
    const selectedFiles = Array.from(files || []);

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (!validFiles.length) {
      showToast("Please select valid image files.", "error");
      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      showToast("Maximum 4 images allowed.", "error");
      return;
    }

    const newImages = validFiles
      .slice(0, remainingSlots)
      .map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
      }));

    setImages((previous) => [...previous, ...newImages]);

    if (validFiles.length > remainingSlots) {
      showToast(`Only ${remainingSlots} image slot(s) available.`, "info");
    }
  };

  const handleFileChange = (event) => {
    handleImages(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    handleImages(event.dataTransfer.files);
  };

  const removeImage = (id) => {
    setImages((previous) => {
      const target = previous.find((image) => image.id === id);

      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }

      return previous.filter((image) => image.id !== id);
    });
  };

  /* =========================================================
     CATEGORY
  ========================================================== */
  const handleCategoryChange = (event) => {
    const selected = event.target.value;

    setValue("Category", selected, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (selected === "Clothing" || selected === "Shoes") {
      setValue("CustomCategory", "", {
        shouldValidate: false,
      });
    }

    if (selected === "Other") {
      setValue("Size", "", {
        shouldValidate: false,
      });
    }

    if (
      selected !== "Clothing" &&
      selected !== "Shoes" &&
      selected !== "Other"
    ) {
      setValue("Size", "", {
        shouldValidate: false,
      });

      setValue("CustomCategory", "", {
        shouldValidate: false,
      });
    }
  };

  /* =========================================================
     HIGHLIGHTS
  ========================================================== */

  const addHighlight = () => {
    if (highlights.length >= MAX_HIGHLIGHTS) {
      showToast("Maximum 5 highlights allowed.", "info");
      return;
    }

    setHighlights((previous) => [...previous, Math.max(...previous, 0) + 1]);
  };

  const removeHighlight = (number) => {
    if (highlights.length === 1) {
      setValue(`Point${number}`, "");
      return;
    }

    setHighlights((previous) => previous.filter((item) => item !== number));

    setValue(`Point${number}`, "");
  };

  /* =========================================================
     COMPLETION
  ========================================================== */
  const completion = useMemo(() => {
    const requiredChecks = [
      Boolean(productTitle),
      Boolean(price),
      Boolean(stockQuantity),
      Boolean(category),
      category === "Other"
        ? Boolean(customCategory)
        : category === "Clothing" || category === "Shoes"
          ? Boolean(size)
          : true,
      Boolean(description),
      images.length > 0,
      highlights.some((number) => Boolean(watch(`Point${number}`))),
    ];

    const completed = requiredChecks.filter(Boolean).length;

    return Math.round((completed / requiredChecks.length) * 100);
  }, [
    productTitle,
    price,
    stockQuantity,
    category,
    customCategory,
    size,
    description,
    images.length,
    highlights,
    watch,
  ]);

  /* =========================================================
     FORM DATA
  ========================================================== */
  const onSubmit = async (data) => {
    try {
      setSuccess(false);

      // ================================
      // CREATE FORMDATA
      // ================================
      const formData = new FormData();

      // Product Title
      formData.append("ProductTitle", data.ProductTitle?.trim() || "");

      // Price
      formData.append("Price", String(Number(data.Price)));

      // Stock
      formData.append("StockQuantity", String(Number(data.StockQuantity)));

      // ================================
      // CATEGORY
      // ================================

      const finalCategory = data.Category === "Other" ? data.CustomCategory?.trim() : data.Category;
        
      formData.append("Category", finalCategory || "");

      // ================================
      // SIZE
      // ================================

      formData.append("Size", data.Size || "");

      // ================================
      // DESCRIPTION
      // ================================

      formData.append("Description", data.Description?.trim() || "");

      formData.append("ReplaceDay", String(Number(data.ReplaceDay || 0)));

      formData.append("Warranty", data.Warranty?.trim() || "");

      for (let i = 1; i <= 5; i++) {
        const point = data[`Point${i}`]?.trim();

        if (point) {
          formData.append(`Point${i}`, point);
        }
      }

      images.forEach((image) => {
        if (image.file) {
          formData.append("images", image.file);
        }
      });

      console.log("Sending product data...");

      const response = await axios.post("/api/vendor/addProduct", formData);

      console.log("API RESPONSE:", response.data);

      if (response.data?.success) {
        toast.success(response.data.message || "Product added successfully");
        setSuccess(true);
        resetForm();
        return;
      }

      toast.error(response.data?.message || "Failed to add product");
    } catch (error) {
      console.error("PRODUCT SUBMIT ERROR:", error);

      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    }
  };

  /* =========================================================
     RESET
  ========================================================== */
  const resetForm = () => {
    images.forEach((image) => {
      if (image.preview) URL.revokeObjectURL(image.preview);
    });

    reset();
    setImages([]);
    setHighlights([1]);
    setSuccess(false);
    setActiveSection("basic");
    toast.info("Form has been reset.", "info");
  };

  /* =========================================================
     LIVE CATEGORY
  ========================================================== */
  const selectedCategory = categories.find((item) => item.value === category);

  const displayCategory = category === "Other" ? customCategory || "Custom Category" : selectedCategory?.label || "Category";
    

  /* =========================================================
     SECTIONS
  ========================================================== */
  const sections = [
    {
      id: "basic",
      label: "Basic",
      icon: Package,
    },
    {
      id: "description",
      label: "Details",
      icon: FileText,
    },
    {
      id: "images",
      label: "Images",
      icon: ImagePlus,
    },
    {
      id: "highlights",
      label: "Highlights",
      icon: Sparkles,
    },
  ];

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#f5f7fb] px-3 py-4 sm:px-5 md:px-8 lg:px-10"
      onScroll={() => {}}
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <motion.div
        animate={{
          x: mouse.x,
          y: mouse.y,
        }}
        transition={{
          type: "spring",
          stiffness: 40,
          damping: 20,
        }}
        className="pointer-events-none fixed -left-40 -top-40 h-120 w-120 rounded-full bg-blue-300/20 blur-3xl"
      />

      <motion.div
        animate={{
          x: -mouse.x,
          y: -mouse.y,
        }}
        transition={{
          type: "spring",
          stiffness: 40,
          damping: 20,
        }}
        className="pointer-events-none fixed -bottom-48 -right-40 h-[34rem] w-[34rem] rounded-full bg-violet-300/20 blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-200/20 blur-3xl"
      />

      {/* =====================================================
          PAGE
      ====================================================== */}
      <motion.div
        initial={{
          opacity: 0,
          y: 35,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative mx-auto w-full max-w-350"
      >
        {/* ===================================================
            TOP BAR
        ==================================================== */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={() => window.history.back()}
              whileHover={{
                scale: 1.04,
                x: -3,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span className="text-xs">Back</span>
            </motion.button>

            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-blue-600" />

                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                  Product Studio
                </span>
              </div>

              <h1 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Add New Product
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ y: -2 }}
              className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur"
            >
              <div className="relative h-9 w-9">
                <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />

                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={94.2}
                    animate={{
                      strokeDashoffset: 94.2 - (94.2 * completion) / 100,
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                  />
                </svg>

                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-700">
                  {completion}%
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Completion
                </p>

                <p className="text-xs font-bold text-slate-700">
                  {completion === 100 ? "Ready to publish" : "Keep going"}
                </p>
              </div>
            </motion.div>

            {success === true && (
              <motion.button
                type="button"
                onClick={resetForm}
                whileHover={{
                  scale: 1.04,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="cursor-pointer flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* ===================================================
            STEPPER
        ==================================================== */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-white bg-white/80 p-2 shadow-sm backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1">
            {sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`group relative flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition cursor-pointer ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <Icon size={16} />

                  <span className="hidden sm:block">{section.label}</span>

                  {index < sections.length - 1 && (
                    <span
                      className={`absolute -right-1 hidden h-1 w-1 rounded-full sm:block ${
                        activeSection === section.id
                          ? "bg-white"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================
            MAIN GRID
        ==================================================== */}
        <div
          className={`grid gap-5 ${
            showPreview
              ? "lg:grid-cols-[minmax(0,1fr)_350px]"
              : "lg:grid-cols-1"
          }`}
        >
          {/* =================================================
              FORM CARD
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
            }}
            className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_30px_100px_rgba(15,23,42,0.10)]"
          >
            {/* HEADER */}

            <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 px-5 py-7 text-white sm:px-8">
              <motion.div
                animate={{
                  x: [0, 50, 0],
                  y: [0, -20, 0],
                  rotate: [0, 8, 0],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
              />

              <motion.div
                animate={{
                  x: [0, -40, 0],
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 11,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl"
              />

              <div className="relative flex items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      rotate: [0, -3, 3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-xl backdrop-blur-xl"
                  >
                    <Package size={28} />
                  </motion.div>

                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full bg-white/15 px-2 py-1 text-[9px] font-black uppercase tracking-wider">
                        New
                      </span>

                      <span className="text-[10px] font-bold text-blue-100">
                        Step-by-step
                      </span>
                    </div>

                    <h2 className="text-xl font-black sm:text-2xl">
                      Product Details
                    </h2>

                    <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                      Create a beautiful product listing.
                    </p>
                  </div>
                </div>

                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                  }}
                  className="hidden sm:block"
                >
                  <WandSparkles size={32} className="text-white/60" />
                </motion.div>
              </div>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-4 sm:p-6 md:p-8"
            >
              {/* =================================================
                  BASIC INFORMATION
              ================================================== */}

              <motion.section
                id="basic"
                onViewportEnter={() => setActiveSection("basic")}
                viewport={{ amount: 0.25 }}
              >
                <SectionHeader
                  icon={Package}
                  title="Basic Information"
                  subtitle="Tell customers what you're selling"
                  color="blue"
                  badge="Step 01"
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FloatingInput
                    id="ProductTitle"
                    icon={Tag}
                    label="Product Title"
                    value={productTitle}
                    error={errors.ProductTitle?.message}
                    registerProps={register("ProductTitle", {
                      required: "Product title is required",
                      minLength: {
                        value: 3,
                        message: "Minimum 3 characters required",
                      },
                      maxLength: {
                        value: 100,
                        message: "Maximum 100 characters allowed",
                      },
                    })}
                  />

                  <FloatingInput
                    id="Price"
                    icon={IndianRupee}
                    label="Product Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    error={errors.Price?.message}
                    registerProps={register("Price", {
                      required: "Price is required",
                      min: {
                        value: 0,
                        message: "Price cannot be negative",
                      },
                    })}
                  />

                  <FloatingInput
                    id="StockQuantity"
                    icon={Boxes}
                    label="Stock Quantity"
                    type="number"
                    min="0"
                    value={stockQuantity}
                    error={errors.StockQuantity?.message}
                    registerProps={register("StockQuantity", {
                      required: "Stock quantity is required",
                      min: {
                        value: 0,
                        message: "Stock cannot be negative",
                      },
                    })}
                  />

                  {/* CATEGORY */}

                  <motion.div
                    animate={
                      errors.Category
                        ? {
                            x: [0, -3, 3, -2, 2, 0],
                          }
                        : {}
                    }
                    className="relative"
                  >
                    <Tag
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 z-20 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      id="Category"
                      value={category}
                      onChange={handleCategoryChange}
                      className={`cursor-pointer h-14 w-full appearance-none rounded-2xl border bg-slate-50 pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
                        errors.Category ? "border-red-300" : "border-slate-200"
                      }`}
                    >
                      <option value="">Select Category</option>

                      {categories.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.emoji} {item.label}
                        </option>
                      ))}
                    </select>

                    <label className="pointer-events-none absolute -top-2 left-11 bg-white px-1 text-[11px] font-bold text-slate-600">
                      Category
                    </label>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="hidden"
                      {...register("Category", {
                        required: "Please select a category",
                      })}
                    />

                    <FieldError message={errors.Category?.message} />
                  </motion.div>
                </div>

                {/* CATEGORY CHIP */}

                <AnimatePresence mode="wait">
                  {selectedCategory && (
                    <motion.div
                      key={selectedCategory.value}
                      initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                      }}
                      className="mt-5"
                    >
                      <div
                        className={`relative overflow-hidden rounded-2xl bg-linear-to-r ${selectedCategory.color} p-px`}
                      >
                        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                          <span className="text-2xl">
                            {selectedCategory.emoji}
                          </span>

                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Selected Category
                            </p>

                            <p className="text-sm font-bold text-slate-800">
                              {selectedCategory.label}
                            </p>
                          </div>

                          <CheckCircle2
                            size={19}
                            className="text-emerald-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CUSTOM CATEGORY */}

                <AnimatePresence>
                  {category === "Other" && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                        y: -15,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        y: -15,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <Plus size={17} className="text-amber-600" />

                          <span className="text-xs font-bold text-amber-700">
                            Custom Category
                          </span>
                        </div>

                        <FloatingInput
                          id="CustomCategory"
                          icon={Plus}
                          label="Enter Custom Category"
                          value={customCategory}
                          error={errors.CustomCategory?.message}
                          registerProps={register("CustomCategory", {
                            required:
                              category === "Other"
                                ? "Please enter your category"
                                : false,
                            minLength: {
                              value: 2,
                              message: "Category must be at least 2 characters",
                            },
                            maxLength: {
                              value: 50,
                              message: "Category cannot exceed 50 characters",
                            },
                          })}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SIZE */}

                <AnimatePresence>
                  {(category === "Clothing" || category === "Shoes") && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                        y: -15,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        y: -15,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 rounded-2xl border border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <Ruler size={17} className="text-blue-600" />

                          <span className="text-xs font-bold text-blue-700">
                            {category === "Shoes"
                              ? "Choose Shoe Size"
                              : "Choose Clothing Size"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                          {(category === "Shoes"
                            ? shoeSizes
                            : clothingSizes
                          ).map((item) => {
                            const value = Array.isArray(item) ? item[0] : item;

                            const label = Array.isArray(item) ? item[1] : item;

                            const selected = size === value;

                            return (
                              <motion.button
                                key={value}
                                type="button"
                                whileHover={{
                                  y: -3,
                                }}
                                whileTap={{
                                  scale: 0.94,
                                }}
                                onClick={() =>
                                  setValue("Size", value, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  })
                                }
                                className={`rounded-xl border px-3 py-3 text-xs font-bold transition-all ${
                                  selected
                                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "border-white bg-white text-slate-600 hover:border-blue-300"
                                }`}
                              >
                                <span className="block">{value}</span>

                                {category === "Clothing" && (
                                  <span
                                    className={`mt-0.5 block truncate text-[8px] ${
                                      selected
                                        ? "text-blue-100"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {label}
                                  </span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>

                        <input
                          type="hidden"
                          {...register("Size", {
                            required:
                              category === "Clothing" || category === "Shoes"
                                ? "Please select a size"
                                : false,
                          })}
                        />

                        <FieldError message={errors.Size?.message} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>

              {/* =================================================
                  DESCRIPTION
              ================================================== */}

              <motion.section
                id="description"
                onViewportEnter={() => setActiveSection("description")}
                viewport={{ amount: 0.25 }}
                className="mt-10 border-t border-slate-100 pt-8"
              >
                <SectionHeader
                  icon={FileText}
                  title="Product Description"
                  subtitle="Give customers enough information"
                  color="indigo"
                  badge="Step 02"
                />

                <div className="relative">
                  <textarea
                    rows={6}
                    placeholder=" "
                    {...register("Description", {
                      required: "Product description is required",
                      minLength: {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      },
                      maxLength: {
                        value: 1000,
                        message: "Description cannot exceed 1000 characters",
                      },
                    })}
                    className={`peer w-full resize-none rounded-2xl border bg-slate-50 px-4 pb-4 pt-7 text-sm text-slate-800 outline-none transition-all hover:bg-white focus:bg-white focus:ring-4 ${
                      errors.Description
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                    }`}
                  />

                  <label
                    className={`pointer-events-none absolute left-4 bg-slate-50 px-1 text-sm text-slate-400 transition-all peer-focus:-top-2 peer-focus:bg-white peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-600 ${
                      description
                        ? "-top-2 bg-white text-[11px] font-bold text-slate-600"
                        : "top-5"
                    }`}
                  >
                    Product Description
                  </label>

                  <span className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-white px-2 py-1 text-[9px] font-bold text-slate-400 shadow-sm">
                    {description?.length || 0}/1000
                  </span>
                </div>

                <FieldError message={errors.Description?.message} />
              </motion.section>

              {/* =================================================
                  WARRANTY
              ================================================== */}

              <section className="mt-10 border-t border-slate-100 pt-8">
                <SectionHeader
                  icon={ShieldCheck}
                  title="Replacement & Warranty"
                  subtitle="Build customer confidence"
                  color="emerald"
                  badge="Optional"
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FloatingInput
                    id="ReplaceDay"
                    icon={RotateCcw}
                    label="Replacement Days"
                    type="number"
                    min="0"
                    value={replaceDay}
                    error={errors.ReplaceDay?.message}
                    registerProps={register("ReplaceDay", {
                      min: {
                        value: 0,
                        message: "Days cannot be negative",
                      },
                    })}
                  />

                  <FloatingInput
                    id="Warranty"
                    icon={ShieldCheck}
                    label="Warranty"
                    value={warranty}
                    error={errors.Warranty?.message}
                    registerProps={register("Warranty", {
                      maxLength: {
                        value: 100,
                        message: "Warranty cannot exceed 100 characters",
                      },
                    })}
                  />
                </div>
              </section>

              {/* =================================================
                  IMAGES
              ================================================== */}

              <motion.section
                id="images"
                onViewportEnter={() => setActiveSection("images")}
                viewport={{ amount: 0.25 }}
                className="mt-10 border-t border-slate-100 pt-8"
              >
                <SectionHeader
                  icon={ImagePlus}
                  title="Product Images"
                  subtitle="Your first image becomes the cover"
                  color="purple"
                  badge={`${images.length}/4`}
                />

                <motion.label
                  htmlFor="productImages"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  whileHover={{
                    scale: 1.005,
                  }}
                  className={`group relative flex min-h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed p-6 text-center transition-all ${
                    dragActive
                      ? "border-blue-500 bg-blue-50 shadow-xl shadow-blue-500/10"
                      : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id="productImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={images.length >= 4}
                    className="hidden"
                  />

                  <motion.div
                    animate={{
                      y: [0, -7, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm"
                  >
                    <UploadCloud size={29} />
                  </motion.div>

                  <p className="text-sm font-black text-slate-700">
                    {images.length >= 4
                      ? "All 4 image slots are filled"
                      : dragActive
                        ? "Drop your images here"
                        : "Click to upload or drag & drop"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PNG • JPG • JPEG • WEBP
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    {Array.from({
                      length: MAX_IMAGES,
                    }).map((_, index) => (
                      <motion.span
                        key={index}
                        animate={{
                          scale: index < images.length ? [1, 1.15, 1] : 1,
                        }}
                        className={`h-2 w-8 rounded-full ${
                          index < images.length ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </motion.label>

                {/* IMAGE REORDER */}

                <AnimatePresence>
                  {images.length > 0 && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-5"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500">
                          Drag images to reorder
                        </p>

                        <span className="text-[10px] font-bold text-slate-400">
                          First image = Cover
                        </span>
                      </div>

                      <Reorder.Group
                        axis="x"
                        values={images}
                        onReorder={setImages}
                        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                      >
                        {images.map((image, index) => (
                          <Reorder.Item
                            key={image.id}
                            value={image}
                            className="group relative aspect-square cursor-grab overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm active:cursor-grabbing"
                          >
                            <img
                              src={image.preview}
                              alt={`Product ${index + 1}`}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                            />

                            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3 pt-8">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-white">
                                  {index === 0
                                    ? "★ COVER"
                                    : `IMAGE ${index + 1}`}
                                </span>

                                <GripVertical
                                  size={14}
                                  className="text-white/80"
                                />
                              </div>
                            </div>

                            <motion.button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              whileHover={{
                                scale: 1.1,
                              }}
                              whileTap={{
                                scale: 0.9,
                              }}
                              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-lg"
                            >
                              <X size={25} className="cursor-pointer" />
                            </motion.button>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>

              {/* =================================================
                  HIGHLIGHTS
              ================================================== */}

              <motion.section
                id="highlights"
                onViewportEnter={() => setActiveSection("highlights")}
                viewport={{ amount: 0.25 }}
                className="mt-10 border-t border-slate-100 pt-8"
              >
                <SectionHeader
                  icon={Sparkles}
                  title="Product Highlights"
                  subtitle="Add your strongest selling points"
                  color="amber"
                  badge={`${highlights.length}/5`}
                />

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {highlights.map((number, index) => {
                      const fieldValue = watch(`Point${number}`);

                      return (
                        <motion.div
                          layout
                          key={number}
                          initial={{
                            opacity: 0,
                            x: -20,
                            scale: 0.96,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            x: 20,
                            scale: 0.96,
                          }}
                          className="group relative space-y-5"
                        >
                          <CheckCircle2
                            size={17}
                            className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 ${
                              fieldValue ? "text-emerald-500" : "text-slate-300"
                            }`}
                          />

                          <input
                            type="text"
                            placeholder=" "
                            {...register(`Point${number}`, {
                              maxLength: {
                                value: 200,
                                message: "Highlight is too long",
                              },
                            })}
                            className="peer h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm outline-none transition-all hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                          />

                          <label className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 bg-slate-50 px-1 text-sm text-slate-400 transition-all peer-focus:-top-1 peer-focus:bg-white peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-600 peer-valid:-top-2 peer-valid:bg-white peer-valid:text-[11px] peer-valid:font-bold peer-valid:text-slate-600">
                            Product Highlight {index + 1}
                          </label>

                          {highlights.length > 1 && (
                            <motion.button
                              type="button"
                              whileHover={{
                                scale: 1.1,
                              }}
                              whileTap={{
                                scale: 0.9,
                              }}
                              onClick={() => removeHighlight(number)}
                              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={15} className="cursor-pointer" />
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {highlights.length < MAX_HIGHLIGHTS && (
                    <motion.button
                      type="button"
                      onClick={addHighlight}
                      whileHover={{
                        y: -2,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 py-3 text-xs font-bold text-amber-600 transition hover:bg-amber-50 cursor-pointer"
                    >
                      <Plus size={16} />
                      Add Another Highlight
                    </motion.button>
                  )}
                </div>
              </motion.section>

              {/* =================================================
                  BUTTONS
              ================================================== */}
              <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:justify-end">
                <motion.button
                  type="button"
                  onClick={resetForm}
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  className="h-13 rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{
                    scale: isSubmitting ? 1 : 1.02,
                  }}
                  whileTap={{
                    scale: isSubmitting ? 1 : 0.97,
                  }}
                  className="relative flex h-13 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 px-8 py-3 text-sm font-black text-white shadow-xl shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  <motion.span
                    animate={{
                      x: ["-150%", "150%"],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-y-0 w-20 skew-x-12 bg-white/20 blur-sm"
                  />

                  {isSubmitting ? (
                    <>
                      <motion.span
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 0.7,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      />
                      Saving Product...
                    </>
                  ) : (
                    <>
                      <Package size={18} />
                      Add Product
                    </>
                  )}
                </motion.button>
              </div>

              {/* SUCCESS */}

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      scale: 0.95,
                    }}
                    className="relative mt-5 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-5"
                  >
                    {/* confetti */}

                    {Array.from({
                      length: 18,
                    }).map((_, index) => (
                      <motion.span
                        key={index}
                        initial={{
                          opacity: 1,
                          y: 20,
                          x: 0,
                        }}
                        animate={{
                          opacity: 0,
                          y: -70 - Math.random() * 80,
                          x: (Math.random() - 0.5) * 350,
                          rotate: Math.random() * 360,
                        }}
                        transition={{
                          duration: 0.8 + Math.random() * 0.7,
                          ease: "easeOut",
                        }}
                        className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
                        style={{
                          backgroundColor: [
                            "#10b981",
                            "#3b82f6",
                            "#8b5cf6",
                            "#f59e0b",
                            "#ec4899",
                          ][index % 5],
                        }}
                      />
                    ))}

                    <div className="relative flex items-center gap-4">
                      <motion.div
                        initial={{
                          scale: 0,
                          rotate: -30,
                        }}
                        animate={{
                          scale: 1,
                          rotate: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 250,
                          damping: 12,
                        }}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      >
                        <CheckCircle2 size={25} />
                      </motion.div>

                      <div>
                        <p className="text-sm font-black text-emerald-700">
                          Product added successfully! 🎉
                        </p>

                        <p className="mt-1 text-xs text-emerald-600">
                          Your product information has been saved successfully.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* =================================================
              LIVE PREVIEW
          ================================================== */}
          {showPreview && (
            <aside className="hidden lg:block">
              <div className="sticky top-5 space-y-5">
                {/* PREVIEW CARD */}

                <motion.div
                  initial={{
                    opacity: 0,
                    x: 25,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.2,
                  }}
                  className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_25px_80px_rgba(15,23,42,0.10)]"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600">
                        Live Preview
                      </p>

                      <p className="mt-0.5 text-xs font-bold text-slate-500">
                        Customer view
                      </p>
                    </div>

                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                    >
                      <Eye size={17} />
                    </motion.div>
                  </div>

                  {/* PRODUCT IMAGE */}

                  <div className="relative m-4 aspect-square overflow-hidden rounded-3xl bg-linear-to-br from-slate-100 to-slate-200">
                    <AnimatePresence mode="wait">
                      {images[0] ? (
                        <motion.img
                          key={images[0].id}
                          initial={{
                            opacity: 0,
                            scale: 1.08,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.95,
                          }}
                          src={images[0].preview}
                          alt="Product preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <motion.div
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          className="flex h-full flex-col items-center justify-center text-slate-300"
                        >
                          <ShoppingBag size={48} strokeWidth={1.3} />

                          <p className="mt-3 text-xs font-bold">
                            Product image
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black text-slate-700 shadow-lg backdrop-blur">
                      {displayCategory}
                    </div>

                    {images.length > 1 && (
                      <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">
                        +{images.length - 1}
                      </div>
                    )}
                  </div>

                  {/* PRODUCT DETAILS */}

                  <div className="px-5 pb-5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${productTitle}-${price}-${category}`}
                        initial={{
                          opacity: 0,
                          y: 5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                      >
                        <div className="mb-2 flex items-center gap-1">
                          {Array.from({
                            length: 5,
                          }).map((_, index) => (
                            <Star
                              key={index}
                              size={11}
                              fill="#fbbf24"
                              className="text-amber-400"
                            />
                          ))}

                          <span className="ml-1 text-[9px] font-bold text-slate-400">
                            New
                          </span>
                        </div>

                        <h3 className="min-h-11 text-base font-black leading-snug text-slate-800">
                          {productTitle || "Your Product Title"}
                        </h3>

                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Price
                            </p>

                            <p className="text-2xl font-black text-slate-900">
                              ₹
                              {price
                                ? Number(price).toLocaleString("en-IN")
                                : "0"}
                            </p>
                          </div>

                          <span className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-black text-emerald-600">
                            {stockQuantity
                              ? `${stockQuantity} in stock`
                              : "In stock"}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            className="flex-1 rounded-xl bg-slate-900 py-3 text-[11px] font-black text-white"
                          >
                            Add to Cart
                          </button>

                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
                          >
                            <ShoppingBag size={16} />
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* COMPLETION */}

                <motion.div
                  whileHover={{
                    y: -3,
                  }}
                  className="rounded-[2rem] border border-white bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">
                        Listing Quality
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Complete all important fields
                      </p>
                    </div>

                    <span className="text-lg font-black text-blue-600">
                      {completion}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      animate={{
                        width: `${completion}%`,
                      }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="h-full rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500"
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      [
                        "Product basics",
                        Boolean(
                          productTitle && price && stockQuantity && category,
                        ),
                      ],
                      ["Description", Boolean(description)],
                      ["Images", images.length > 0],
                      [
                        "Highlights",
                        highlights.some((number) =>
                          Boolean(watch(`Point${number}`)),
                        ),
                      ],
                    ].map(([label, done]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[10px] font-semibold text-slate-500">
                          {label}
                        </span>

                        {done ? (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500"
                          />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* QUICK INFO */}

                <motion.div
                  whileHover={{
                    y: -3,
                  }}
                  className="rounded-[2rem] bg-linear-to-br from-slate-900 to-slate-800 p-5 text-white shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <Zap size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-black">Pro Tip</p>

                      <p className="mt-1 text-[10px] text-slate-300">
                        High-quality images improve product discovery.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/5 p-3">
                      <ImagePlus size={14} className="text-blue-300" />

                      <p className="mt-2 text-[9px] text-slate-400">Images</p>

                      <p className="text-sm font-black">{images.length}/4</p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3">
                      <Layers3 size={14} className="text-violet-300" />

                      <p className="mt-2 text-[9px] text-slate-400">
                        Highlights
                      </p>

                      <p className="text-sm font-black">
                        {highlights.length}/5
                      </p>
                    </div>
                  </div>
                </motion.div>

                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="w-full text-center text-[10px] font-bold text-slate-400 transition hover:text-slate-600"
                >
                  Hide preview
                </button>
              </div>
            </aside>
          )}
        </div>

        {/* SHOW PREVIEW */}
        {!showPreview && (
          <motion.button
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            type="button"
            onClick={() => setShowPreview(true)}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-black text-white shadow-2xl"
          >
            <Eye size={15} />
            Show Preview
          </motion.button>
        )}

        {/* FOOTER */}
        <div className="py-6 text-center text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={14} />
            Your product information is securely handled
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Page;
