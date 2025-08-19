# Firebase Studio

This is a NextJS starter in Firebase Studio.

Directory structure:
└── ferangarita01-muwise/
    ├── README.md
    ├── components.json
    ├── firebase.json
    ├── firestore.rules
    ├── next.config.mjs
    ├── postcss.config.mjs
    ├── tsconfig.json
    ├── .firebaserc
    ├── .modified
    └── src/
        ├── ai/
        │   ├── dev.ts
        │   └── genkit.ts
        ├── app/
        │   ├── api/
        │   │   └── debug/
        │   │       └── route.ts
        │   └── dashboard/
        │       ├── (account)/
        │       │   └── profile/
        │       │       └── page.tsx
        │       ├── agreements/
        │       │   └── page.tsx
        │       └── profile/
        │           └── page.tsx
        ├── components/
        │   ├── ClientOnly.tsx
        │   ├── document-header.tsx
        │   ├── document-layout.tsx
        │   ├── formatted-date.tsx
        │   └── ui/
        │       ├── collapsible.tsx
        │       ├── document-layout.tsx
        │       ├── input.tsx
        │       ├── label.tsx
        │       ├── progress.tsx
        │       ├── separator.tsx
        │       ├── skeleton.tsx
        │       ├── textarea.tsx
        │       └── toaster.tsx
        ├── hooks/
        │   └── use-mobile.tsx
        └── lib/
            ├── email.ts
            ├── firebase-client.ts
            └── utils.ts


To get started, take a look at src/app/page.tsx.
