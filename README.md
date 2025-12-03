# Simple Image Duplicate Finder

A Node.js script to find and move duplicate images based on perceptual hashing.  
It scans a folder recursively for images, computes perceptual hashes, groups duplicates by similarity, and moves smaller duplicates to a duplicates folder.

## Features

- Supports common image formats: JPG, JPEG, PNG, HEIC
- Uses perceptual hashing with configurable hash size and duplicate threshold
- Moves smaller duplicates to a designated folder, keeps largest file
- Recursively scans subfolders inside the base directory

## Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager

## Installation

1. Clone this repository or copy the script source code.
2. Install dependencies:

```bash
npm install
```

3. Change directory or copy images in ./images folder:

```bash
const FRAME_DIR = '/your/directory/with/images'
```

4. Select the presicion.
   This value balances precision and recall

- Lower threshold (e.g., 5) → stricter matching, fewer false positives, but might miss some duplicates.
- Higher threshold (e.g., 15) → more lenient, catching more duplicates but increasing false positives (non-identical images flagged as duplicates).

```bash
const DUPLICATE_THRESHOLD = 8 // 8 - 10 is usually a good starting point
```

5. Start:

```bash
npm run start
```
