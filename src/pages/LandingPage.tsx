import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileCheck,
  Users,
  BarChart3,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BookOpen,
    title: "Quản lý lớp học",
    description: "Tạo lớp, mời sinh viên bằng mã lớp, quản lý thành viên và bài tập trong một nơi.",
  },
  {
    icon: FileCheck,
    title: "Giao bài & chấm điểm",
    description: "Giao bài tập kèm file, hạn nộp, cho phép nộp trễ. Chấm điểm và nhận xét trực tiếp trên bài nộp.",
  },
  {
    icon: BarChart3,
    title: "Bảng điểm tổng hợp",
    description: "Xem điểm trung bình lớp, xuất Excel, lọc theo tiến độ chấm và theo học sinh.",
  },
  {
    icon: Users,
    title: "Trao đổi & nhận xét",
    description: "Comment trên bài tập và bài nộp, thông báo khi có điểm mới hoặc nhận xét từ giảng viên.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg">NNPTUD LMS</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Bắt đầu</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Hệ thống quản lý học tập
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Học tập, giao bài và{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                chấm điểm
              </span>{" "}
              trong một nền tảng
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              NNPTUD LMS giúp giảng viên quản lý lớp, giao bài tập và theo dõi điểm số. Sinh viên nộp bài, xem điểm và trao đổi với giảng viên dễ dàng.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="gap-2 text-base" asChild>
                <Link to="/login">
                  Đăng nhập
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link to="/login">Tạo tài khoản (liên hệ Admin)</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="border-t border-border/50 bg-muted/20 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Mọi thứ bạn cần để dạy và học
              </h2>
              <p className="mt-4 text-muted-foreground">
                Từ quản lý lớp, giao bài đến chấm điểm và bảng điểm — tất cả trong một ứng dụng.
              </p>
            </motion.div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={cn(
                    "rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
                    "flex flex-col"
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center md:p-12"
          >
            <h2 className="text-2xl font-bold sm:text-3xl">
              Sẵn sàng sử dụng?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Đăng nhập bằng tài khoản do nhà trường cấp để vào hệ thống.
            </p>
            <Button size="lg" className="mt-6 gap-2" asChild>
              <Link to="/login">
                Đăng nhập ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-5 w-5" />
            <span className="font-medium text-foreground">NNPTUD LMS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Hệ thống quản lý học tập — NNPTUD
          </p>
        </div>
      </footer>
    </div>
  );
}
