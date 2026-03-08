import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValueEvent,
} from "framer-motion";
import {
  BookOpen,
  FileCheck,
  Users,
  BarChart3,
  ArrowRight,
  GraduationCap,
  Sparkles,
  MessageSquare,
  Shield,
  Zap,
  Clock,
  ChevronDown,
  Star,
  Globe,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* floating orbs (decorative) */
function FloatingOrb({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(
        "absolute rounded-full blur-3xl opacity-20 pointer-events-none",
        className
      )}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/* reveal wrapper */
function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 60 : 0,
      x: direction === "left" ? -60 : direction === "right" ? 60 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* parallax card */
function ParallaxCard({
  children,
  className,
  offset = 80,
}: {
  children: React.ReactNode;
  className?: string;
  offset?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* counter animation */
function AnimatedCounter({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const motionValue = useTransform(scrollYProgress, [0, 1], [0, value]);

  useMotionValueEvent(motionValue, "change", (latest) => {
    if (isInView) setDisplay(Math.round(latest));
  });

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
        {isInView ? display : 0}
        {suffix}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/* feature data */
const features = [
  {
    icon: BookOpen,
    title: "Quản lý lớp học",
    description:
      "Tạo lớp, mời sinh viên bằng mã lớp, quản lý thành viên và tài liệu dễ dàng.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: FileCheck,
    title: "Giao bài & chấm điểm",
    description:
      "Giao bài, đính kèm file, thiết lập deadline linh hoạt. Chấm điểm trực tiếp.",
    gradient: "from-sky-500 to-cyan-400",
  },
  {
    icon: BarChart3,
    title: "Bảng điểm tổng hợp",
    description:
      "Xuất Excel, CSV, PDF. Lọc theo tiến độ, xếp loại và phân tích chi tiết.",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: MessageSquare,
    title: "Hội thoại realtime",
    description:
      "Chat nhóm lớp, thông báo realtime, trao đổi bài tập với Socket.io.",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    icon: CalendarDays,
    title: "Lịch deadline",
    description:
      "Xem tất cả deadline trên calendar, không bỏ lỡ bài tập nào.",
    gradient: "from-rose-500 to-pink-400",
  },
  {
    icon: Shield,
    title: "Bảo mật & phân quyền",
    description:
      "JWT authentication, phân quyền Admin/Teacher/Student rõ ràng.",
    gradient: "from-blue-500 to-sky-400",
  },
];

const highlights = [
  { icon: Zap, text: "Realtime với Socket.io" },
  { icon: Globe, text: "Responsive mọi thiết bị" },
  { icon: Clock, text: "Dark mode tự động" },
  { icon: Star, text: "Export PDF/Excel/CSV" },
];

/* MAIN COMPONENT */
export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(heroProgress, [0, 0.5], [0, 60]);

  return (
    <div className="relative bg-background text-foreground overflow-x-hidden">
      {/* NAVBAR */}
      <motion.header
        className="fixed top-0 inset-x-0 z-50 border-b border-transparent bg-background/60 backdrop-blur-xl backdrop-saturate-150 transition-colors"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-semibold text-foreground group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-110">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg tracking-tight">NNPTUD LMS</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button
              className="gap-2 shadow-lg shadow-primary/25"
              asChild
            >
              <Link to="/login">
                Bắt đầu ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </motion.header>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background orbs */}
        <FloatingOrb
          className="w-[600px] h-[600px] bg-primary -top-40 -right-40"
          delay={0}
        />
        <FloatingOrb
          className="w-[500px] h-[500px] bg-sky-500 -bottom-32 -left-32"
          delay={2}
        />
        <FloatingOrb
          className="w-[300px] h-[300px] bg-cyan-400 top-1/3 left-1/4"
          delay={4}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 container mx-auto px-4"
        >
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4" />
              Hệ thống quản lý học tập thông minh
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[1.6]"
            >
              <span className="block">Nền tảng</span>
              <span className="block bg-gradient-to-r from-primary via-sky-500 to-cyan-500 bg-clip-text text-transparent pb-2">
                dạy &amp; học
              </span>
              <span className="block mt-2">hiện đại</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
            >
              Quản lý lớp học, giao bài tập, chấm điểm, hội thoại realtime —
              tất cả trong một nền tảng LMS được thiết kế cho trải nghiệm tốt nhất.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="h-14 px-8 text-base gap-2 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-shadow"
                asChild
              >
                <Link to="/login">
                  Đăng nhập
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base rounded-2xl border-2"
                asChild
              >
                <a href="#features">Tìm hiểu thêm</a>
              </Button>
            </motion.div>

            {/* Highlights pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-3"
            >
              {highlights.map((h, i) => (
                <motion.span
                  key={h.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground border border-border/50"
                >
                  <h.icon className="h-3.5 w-3.5 text-primary" />
                  {h.text}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs font-medium tracking-wider uppercase">
              Cuộn xuống
            </span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* PREVIEW / SHOWCASE */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Giao diện{" "}
                <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                  trực quan
                </span>
                , trải nghiệm mượt mà
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Dashboard chuyên biệt cho từng vai trò — Admin, Giảng viên, Sinh viên.
              </p>
            </div>
          </Reveal>

          {/* Floating preview cards */}
          <div className="relative mx-auto max-w-5xl">
            <ParallaxCard
              className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50"
              offset={40}
            >
              <div className="bg-gradient-to-br from-card via-card to-muted/50 p-6 md:p-10">
                {/* Mock dashboard UI */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="ml-4 h-6 w-48 rounded-md bg-muted animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Lớp học", val: "5", color: "text-blue-500" },
                    { label: "Bài tập", val: "24", color: "text-violet-500" },
                    { label: "Sinh viên", val: "156", color: "text-emerald-500" },
                  ].map((stat) => (
                    <Reveal key={stat.label} delay={0.1}>
                      <div className="rounded-2xl bg-muted/50 p-4 border border-border/30">
                        <p className={cn("text-2xl md:text-3xl font-bold", stat.color)}>
                          {stat.val}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {stat.label}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-muted/50 p-4 border border-border/30 h-32">
                    <div className="h-3 w-24 bg-muted rounded mb-3" />
                    <div className="flex items-end gap-1.5 h-16">
                      {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                          className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted/50 p-4 border border-border/30 h-32">
                    <div className="h-3 w-20 bg-muted rounded mb-3" />
                    <div className="space-y-2">
                      {[85, 72, 60].map((w, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary/60" />
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${w}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 + i * 0.15, duration: 0.6 }}
                            className="h-2.5 bg-gradient-to-r from-primary/60 to-primary/20 rounded-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ParallaxCard>

            {/* Decorative floating elements */}
            <motion.div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-xl hidden md:flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <BarChart3 className="h-10 w-10 text-white" />
            </motion.div>
            <motion.div
              className="absolute -bottom-6 -left-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl hidden md:flex items-center justify-center"
              animate={{ rotate: [0, -5, 5, 0], y: [0, 8, 0] }}
              transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            >
              <Users className="h-8 w-8 text-white" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="relative container mx-auto px-4">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center mb-16">
              <span className="inline-block mb-4 text-sm font-semibold text-primary tracking-wider uppercase">
                Tính năng
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Mọi thứ bạn cần —{" "}
                <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                  không thiếu thứ gì
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Từ quản lý lớp, giao bài đến chấm điểm, hội thoại và báo cáo —
                tất cả trong một ứng dụng.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "group relative rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm p-7 shadow-sm",
                    "hover:shadow-xl hover:border-primary/30 transition-[shadow,border-color] duration-300",
                    "flex flex-col h-full"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                      feature.gradient
                    )}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover glow */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                      "bg-gradient-to-br pointer-events-none",
                      feature.gradient
                    )}
                  />
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <FloatingOrb
          className="w-[500px] h-[500px] bg-primary top-0 right-0"
          delay={1}
        />
        <div className="relative container mx-auto px-4">
          <Reveal>
            <div className="mx-auto max-w-6xl rounded-[2rem] border border-border/50 bg-card/60 backdrop-blur-xl p-10 md:p-16 shadow-2xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Con số{" "}
                  <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                    ấn tượng
                  </span>
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Nền tảng được xây dựng cho khả năng mở rộng.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <AnimatedCounter value={100} suffix="%" label="Uptime cam kết" />
                <AnimatedCounter value={50} suffix="+" label="API endpoints" />
                <AnimatedCounter value={15} suffix="+" label="Trang giao diện" />
                <AnimatedCounter value={3} label="Vai trò phân quyền" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center mb-16">
              <span className="inline-block mb-4 text-sm font-semibold text-primary tracking-wider uppercase">
                Quy trình
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Bắt đầu trong{" "}
                <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                  3 bước
                </span>
              </h2>
            </div>
          </Reveal>

          <div className="mx-auto max-w-4xl">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-violet-500 to-primary/20 hidden md:block" />

              {[
                {
                  step: "01",
                  title: "Đăng nhập vào hệ thống",
                  desc: "Sử dụng tài khoản do nhà trường cấp hoặc được admin tạo. Hệ thống phân quyền tự động theo vai trò.",
                  color: "from-blue-500 to-cyan-400",
                },
                {
                  step: "02",
                  title: "Tạo lớp & giao bài tập",
                  desc: "Giảng viên tạo lớp, mời sinh viên bằng mã lớp, giao bài tập kèm deadline và cho phép nộp trễ.",
                  color: "from-sky-500 to-cyan-400",
                },
                {
                  step: "03",
                  title: "Chấm điểm & theo dõi",
                  desc: "Chấm điểm trực tiếp, nhận xét, xuất bảng điểm. Sinh viên nhận thông báo realtime.",
                  color: "from-emerald-500 to-teal-400",
                },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 0.15}>
                  <div className="flex items-start gap-6 mb-12 last:mb-0">
                    <div
                      className={cn(
                        "relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white text-xl font-bold shadow-lg",
                        item.color
                      )}
                    >
                      {item.step}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 text-muted-foreground leading-relaxed max-w-lg">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL / QUOTE */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="relative container mx-auto px-4">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-8">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground">
                &ldquo;Hệ thống LMS giúp chúng tôi{" "}
                <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                  tiết kiệm 70% thời gian
                </span>{" "}
                quản lý lớp học và chấm điểm so với phương pháp truyền thống.&rdquo;
              </blockquote>
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center text-white font-bold">
                  GV
                </div>
                <div className="text-left">
                  <p className="font-semibold">Giảng viên Khoa CNTT</p>
                  <p className="text-sm text-muted-foreground">
                    Trường Đại học
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="relative mx-auto max-w-4xl rounded-[2.5rem] overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-sky-600 to-blue-700" />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />

              <div className="relative z-10 p-10 md:p-16 text-center text-white">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                    Sẵn sàng trải nghiệm?
                  </h2>
                  <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
                    Đăng nhập bằng tài khoản do nhà trường cấp và khám phá nền tảng
                    LMS hiện đại nhất.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      size="lg"
                      className="h-14 px-10 text-base rounded-2xl bg-white text-primary hover:bg-white/90 shadow-xl gap-2"
                      asChild
                    >
                      <Link to="/login">
                        Đăng nhập ngay
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-10 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">NNPTUD LMS</p>
                <p className="text-xs text-muted-foreground">
                  Hệ thống quản lý học tập
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>React + TypeScript</span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="hidden sm:inline">Node.js + Prisma</span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="hidden sm:inline">Socket.io</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 NNPTUD. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
