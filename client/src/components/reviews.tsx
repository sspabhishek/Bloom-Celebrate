import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const reviews = [
  {
    name: "Ananya Sharma",
    role: "Birthday Decor",
    rating: 5,
    text:
      "They turned our living room into a fairytale. The balloon arch and floral backdrop were stunning, and setup was super smooth!",
  },
  {
    name: "Rahul Verma",
    role: "Corporate Event",
    rating: 5,
    text:
      "Professional team, elegant design, and on-time delivery. They understood our brand theme perfectly and executed flawlessly.",
  },
  {
    name: "Pooja Singh",
    role: "Wedding Reception",
    rating: 5,
    text:
      "The floral arrangements were breathtaking. Guests couldn't stop clicking photos. Highly recommended for premium decor!",
  },
  {
    name: "Saurabh Kumar",
    role: "Engagement Party",
    rating: 4,
    text:
      "Great attention to detail and beautiful color palette. The team was courteous and flexible with last-minute changes.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center text-yellow-400" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={`fas fa-star ${i < count ? "opacity-100" : "opacity-30"} mr-1`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-b from-background via-background to-background/60 dark:from-background dark:via-background dark:to-background/60">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink-400/10 dark:bg-pink-300/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            What Our Clients Say
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            We craft joyful experiences with elegant balloons and fresh florals. Here’s what people loved about working with us.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {reviews.map((r, idx) => (
            <Card
              key={idx}
              className="group h-full rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm transition-transform hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-5 sm:p-6">
                <Stars count={r.rating} />
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground/90">
                  “{r.text}”
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.role}</div>
                  </div>
                  <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-pink-400/30 dark:from-primary/20 dark:to-pink-400/20 flex items-center justify-center">
                    <i className="fas fa-heart text-primary/80" aria-hidden="true" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 sm:mt-14 text-center">
          <p className="text-muted-foreground">Have we made your celebration special?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 mt-3 px-5 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-pen-fancy" aria-hidden="true" />
            Share your feedback
          </a>
        </div>
      </div>
    </section>
  );
}
