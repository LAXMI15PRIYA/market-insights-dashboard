import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-90" aria-hidden />
      <div
        className="absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(600px circle at 20% 20%, rgba(255,255,255,0.15), transparent 60%), radial-gradient(500px circle at 80% 30%, rgba(255,255,255,0.10), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Yahoo Finance
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Stock Price Analyzer
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            Analyze historical stock prices, market trends, and technical indicators using
            Yahoo Finance. Interactive charts, moving averages, and OHLC insights — global
            &amp; Indian markets.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
