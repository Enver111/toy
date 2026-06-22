import React, {
  useState,
  useRef,
  useEffect,
  Fragment,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import AnimatedContent from "./AnimatedContent";

function Reveal({
  children,
  animated = true,
  delay = 0,
  className = "",
  playWhen,
}: {
  children: ReactNode;
  animated?: boolean;
  delay?: number;
  className?: string;
  playWhen?: boolean;
}) {
  if (!animated) {
    return className ? (
      <div className={className}>{children}</div>
    ) : (
      <Fragment>{children}</Fragment>
    );
  }

  return (
    <AnimatedContent
      delay={delay}
      distance={50}
      duration={0.8}
      className={className}
      playWhen={playWhen}
    >
      {children}
    </AnimatedContent>
  );
}

const WEDDING_DATE = new Date(2026, 6, 18, 0, 0, 0);

function getTimeUntilWedding() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

export default function WeddingInvitation() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const exportToPNG = async () => {
    setIsExporting(true);
    try {
      const elements = [
        { ref: frontRef, name: "wedding-invitation-front" },
        { ref: backRef, name: "wedding-invitation-back" },
      ];

      for (const { ref, name } of elements) {
        if (ref.current) {
          const canvas = await html2canvas(ref.current, {
            scale: 3,
            backgroundColor: "#fdfcfb",
            logging: false,
            useCORS: true,
          });

          const link = document.createElement("a");
          link.download = `${name}.png`;
          link.href = canvas.toDataURL("image/png", 1.0);
          link.click();
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Ошибка при экспорте изображений");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 140],
      });

      if (frontRef.current) {
        const frontCanvas = await html2canvas(frontRef.current, {
          scale: 3,
          backgroundColor: "#fdfcfb",
          logging: false,
          useCORS: true,
        });

        const frontImgData = frontCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(frontImgData, "JPEG", 0, 0, 100, 140);
      }

      if (backRef.current) {
        pdf.addPage();
        const backCanvas = await html2canvas(backRef.current, {
          scale: 3,
          backgroundColor: "#fdfcfb",
          logging: false,
          useCORS: true,
        });

        const backImgData = backCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(backImgData, "JPEG", 0, 0, 100, 140);
      }

      pdf.save("wedding-invitation-kadyr-elmaz.pdf");
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Ошибка при создании PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-2"
      style={{
        background: "linear-gradient(135deg, #faf8f5 0%, #f5f0eb 100%)",
      }}
    >
      {/* Hidden export elements */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={frontRef} style={{ width: "400px", height: "600px" }}>
          <FrontSide animated={false} />
        </div>
        <div ref={backRef} style={{ width: "400px", height: "600px" }}>
          <BackSide animated={false} />
        </div>
      </div>

      {/* Controls */}
      {/* <div className="mb-6 flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleFlip}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50"
          style={{
            background: 'rgba(194, 162, 130, 0.15)',
            color: '#8b7355',
            border: '1px solid rgba(194, 162, 130, 0.3)'
          }}
        >
          <RotateCw className="w-4 h-4" />
          <span style={{ fontFamily: 'Cormorant, serif', fontWeight: 500 }}>
            Перевернуть
          </span>
        </button>

        <button
          onClick={exportToPNG}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50"
          style={{
            background: 'rgba(194, 162, 130, 0.25)',
            color: '#8b7355',
            border: '1px solid rgba(194, 162, 130, 0.4)'
          }}
        >
          <ImageIcon className="w-4 h-4" />
          <span style={{ fontFamily: 'Cormorant, serif', fontWeight: 500 }}>
            {isExporting ? 'Экспорт...' : 'PNG (мессенджеры)'}
          </span>
        </button>

        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50"
          style={{
            background: 'rgba(194, 162, 130, 0.35)',
            color: '#8b7355',
            border: '1px solid rgba(194, 162, 130, 0.5)'
          }}
        >
          <FileDown className="w-4 h-4" />
          <span style={{ fontFamily: 'Cormorant, serif', fontWeight: 500 }}>
            {isExporting ? 'Создание...' : 'PDF (печать)'}
          </span>
        </button>
      </div> */}

      {/* Invitation Card Container */}
      <Reveal delay={0.1}>
        <div className="perspective-[2000px]" id="invitation-card">
          <motion.div
            className="relative w-[90vw] h-[85vh] sm:w-[500px]"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={{ transformStyle: "preserve-3d", cursor: "pointer" }}
            onClick={handleFlip}
          >
            {/* Front Side */}
            <motion.div
              className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                background:
                  "linear-gradient(to bottom, #fdfcfb 0%, #f7f4f0 100%)",
                border: "1px solid rgba(194, 162, 130, 0.2)",
              }}
            >
              <FrontSide />
            </motion.div>

            {/* Back Side */}
            <motion.div
              className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background:
                  "linear-gradient(to bottom, #fdfcfb 0%, #f7f4f0 100%)",
                border: "1px solid rgba(194, 162, 130, 0.2)",
              }}
            >
              <BackSide playWhen={isFlipped} />
            </motion.div>
          </motion.div>
        </div>
      </Reveal>

      {/* Footer Note */}
      <p
        className="mt-2 text-md opacity-60 text-center"
        style={{ fontFamily: "Cormorant, serif", color: "#8b7355" }}
      >
        Нажмите на приглашение, чтобы перевернуть
      </p>
    </div>
  );
}

function FrontSide({ animated = true }: { animated?: boolean }) {
  return (
    <div className="relative h-full flex flex-col items-center justify-center p-8">
      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-16 h-16">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0 L50 0 C20 20, 20 20, 0 50 Z"
            fill="rgba(194, 162, 130, 0.15)"
          />
          <circle cx="15" cy="15" r="2" fill="rgba(194, 162, 130, 0.4)" />
        </svg>
      </div>
      <div className="absolute top-8 right-8 w-16 h-16 rotate-90">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0 L50 0 C20 20, 20 20, 0 50 Z"
            fill="rgba(194, 162, 130, 0.15)"
          />
          <circle cx="15" cy="15" r="2" fill="rgba(194, 162, 130, 0.4)" />
        </svg>
      </div>
      <div className="absolute bottom-8 left-8 w-16 h-16 -rotate-90">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0 L50 0 C20 20, 20 20, 0 50 Z"
            fill="rgba(194, 162, 130, 0.15)"
          />
          <circle cx="15" cy="15" r="2" fill="rgba(194, 162, 130, 0.4)" />
        </svg>
      </div>
      <div className="absolute bottom-8 right-8 w-16 h-16 rotate-180">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0 L50 0 C20 20, 20 20, 0 50 Z"
            fill="rgba(194, 162, 130, 0.15)"
          />
          <circle cx="15" cy="15" r="2" fill="rgba(194, 162, 130, 0.4)" />
        </svg>
      </div>

      {/* Floral decoration top */}
      <Reveal animated={animated} delay={0.1} className="mb-6">
        <svg
          width="80"
          height="40"
          viewBox="0 0 80 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M40 35 Q35 20, 30 15 Q35 10, 40 5 Q45 10, 50 15 Q45 20, 40 35"
            fill="rgba(169, 193, 170, 0.3)"
          />
          <circle cx="40" cy="15" r="3" fill="rgba(194, 162, 130, 0.4)" />
          <path
            d="M25 25 Q20 20, 22 15"
            stroke="rgba(169, 193, 170, 0.5)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M55 25 Q60 20, 58 15"
            stroke="rgba(169, 193, 170, 0.5)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </Reveal>

      {/* Main heading */}
      <Reveal animated={animated} delay={0.2}>
        <h1
          className="mb-8 tracking-wider font-bold"
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "1rem",
            letterSpacing: "0.3em",
            color: "#8b7355",
            fontWeight: 400,
            textTransform: "uppercase",
          }}
        >
          Приглашение
        </h1>
      </Reveal>

      {/* Names */}
      <Reveal animated={animated} delay={0.3} className="mb-6 text-center">
        <h2
          style={{
            fontFamily: "Great Vibes, cursive",
            fontSize: "4rem",
            color: "#6b5d51",
            lineHeight: 1.2,
            marginBottom: "0.5rem",
          }}
        >
          Кадыр
        </h2>
        <div
          className="my-3 mx-auto"
          style={{
            width: "60px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(194, 162, 130, 0.6), transparent)",
          }}
        />
        <p
          style={{
            fontFamily: "Cormorant, serif",
            fontSize: "1.25rem",
            color: "#8b7355",
            fontWeight: 300,
            letterSpacing: "0.1em",
          }}
        >
          и
        </p>
        <div
          className="my-3 mx-auto"
          style={{
            width: "60px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(194, 162, 130, 0.6), transparent)",
          }}
        />
        <h2
          style={{
            fontFamily: "Great Vibes, cursive",
            fontSize: "4rem",
            color: "#6b5d51",
            lineHeight: 1.2,
            marginTop: "0.5rem",
          }}
        >
          Эльмаз
        </h2>
      </Reveal>

      {/* Monogram */}
      <Reveal animated={animated} delay={0.45}>
        <div
          style={{
            fontFamily: "Great Vibes, cursive",
            color: "#6b5d51",
            lineHeight: 1.2,
            marginTop: "0.5rem",
          }}
          className="my-8 border px-2 py-5 rounded-full border-[linear-gradient(90deg, transparent, rgba(194, 162, 130, 0.6), transparent)]"
        >
          K&amp;Э
        </div>
      </Reveal>

      {/* Date */}
      <Reveal animated={animated} delay={0.55} className="mt-8 text-center">
        <p
          style={{
            fontFamily: "Cormorant, serif",
            fontSize: "1.5rem",
            color: "#8b7355",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          18 Июля 2026
        </p>
      </Reveal>

      {/* Floral decoration bottom */}
      <Reveal animated={animated} delay={0.65} className="mt-8">
        <svg
          width="100"
          height="20"
          viewBox="0 0 100 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 10 Q30 5, 50 10 Q70 15, 90 10"
            stroke="rgba(169, 193, 170, 0.4)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="20" cy="8" r="2" fill="rgba(194, 162, 130, 0.3)" />
          <circle cx="50" cy="10" r="2.5" fill="rgba(194, 162, 130, 0.4)" />
          <circle cx="80" cy="8" r="2" fill="rgba(194, 162, 130, 0.3)" />
        </svg>
      </Reveal>
    </div>
  );
}

function BackSide({
  animated = true,
  playWhen = false,
}: {
  animated?: boolean;
  playWhen?: boolean;
}) {
  const [countdown, setCountdown] = useState(getTimeUntilWedding);

  useEffect(() => {
    const tick = () => setCountdown(getTimeUntilWedding());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className=" flex overflow-y-auto scrollbar-hide h-full flex-col items-center justify-between p-5">
      <div className=" z-10 h-auto flex-1 w-full flex flex-col gap-2 items-center justify-between text-center p-2 rounded-lg border border-wedding-gold/20 shadow-[inset_0_0_30px_rgb(194_162_130/0.05)]">
        <Reveal animated={animated} playWhen={playWhen} delay={0.1}>
          <div>
            <p className="wedding-section-title text-lg font-bold ">
              Дорогие друзья и близкие!
            </p>
            <p className="font-cormorant text-lg leading-relaxed font-light text-wedding-accent">
              Приглашаем Вас отпраздновать самое важное событие в нашей жизни -
              день свадьбы!
            </p>
          </div>
        </Reveal>

        <div className="wedding-divider" />

        <Reveal animated={animated} playWhen={playWhen} delay={0.25}>
          <div>
            <p className="wedding-section-title font-bold text-lg">
              Свадебный вечер
            </p>
            <p className=" font-cormorant text-2xl  italic text-wedding-accent font-bold">
              18 июля 2026
            </p>
            <p className="wedding-body font-medium text-lg">
              18:00 • Банкетный зал "Eshil Ada"
            </p>
            <p className="wedding-body-muted font-medium text-lg">
              ул. Байрам, 5, г. Симферополь
            </p>
          </div>
        </Reveal>

        <div className="wedding-divider" />

        <Reveal animated={animated} playWhen={playWhen} delay={0.4}>
          <div>
            <p className=" wedding-section-title text-lg font-bold">
              До бракосочетания
            </p>
            {countdown.isPast ? (
              <p className="font-cormorant text-2xl font-normal italic text-wedding-text">
                Наш день настал!
              </p>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                {(
                  [
                    { value: countdown.days, label: "дней" },
                    { value: countdown.hours, label: "часов" },
                    { value: countdown.minutes, label: "минут" },
                    { value: countdown.seconds, label: "секунд" },
                  ] as const
                ).map(({ value, label }) => (
                  <div key={label} className="min-w-[3.25rem] text-center">
                    <p className="font-cormorant text-3xl leading-tight font-medium text-wedding-text">
                      {String(value).padStart(2, "0")}
                    </p>
                    <p className="mt-0.5 font-cormorant text-xs font-light text-wedding-muted">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* <div className="wedding-divider" /> */}

        {/* <div>
          <p className="mb-3 font-playfair text-sm font-medium uppercase tracking-[0.15em] text-wedding-accent">
            Дресс-код
          </p>
          <div className="flex justify-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="size-10 rounded-full bg-[#f5e6d3]" />
              <span className="font-cormorant text-xs text-wedding-muted">Бежевый</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="size-10 rounded-full bg-[#e8d5c4]" />
              <span className="font-cormorant text-xs text-wedding-muted">Пудровый</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="size-10 rounded-full bg-[#a9c1aa]" />
              <span className="font-cormorant text-xs text-wedding-muted">Шалфей</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="size-10 rounded-full bg-[#d4a574]" />
              <span className="font-cormorant text-xs text-wedding-muted">Золото</span>
            </div>
          </div>
        </div> */}

        <div className="wedding-divider" />

        <Reveal animated={animated} playWhen={playWhen} delay={0.55}>
          <div>
            <p className="font-cormorant text-xl font-normal text-wedding-accent">
              Подтвердите своё присутствие
              <br />
              до 10 июня 2026
            </p>
            <p className="mt-3 font-cormorant text-lg font-light text-wedding-muted">
              +7 (978) 786-56-83
            </p>
          </div>
        </Reveal>

        <Reveal
          animated={animated}
          playWhen={playWhen}
          delay={0.65}
          className=" flex items-center justify-center"
        >
          <svg
            width="60"
            height="20"
            viewBox="0 0 60 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 10 Q15 5, 30 10 Q45 15, 55 10"
              stroke="rgba(169, 193, 170, 0.4)"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="30" cy="10" r="2" fill="rgba(194, 162, 130, 0.4)" />
          </svg>
        </Reveal>
      </div>
    </div>
  );
}
