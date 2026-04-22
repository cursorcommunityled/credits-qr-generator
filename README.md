# Cursor Bulk QR Generator

This project helps Cursor Ambassadors and event hosts turn the redeem-link CSV shared by the Cursor team into branded, printable QR cards for in-person distribution.

If you want to hand out physical Cursor credit cards at a meetup, workshop, or community event, upload the CSV file and/or paste extra redeem links manually, generate one card per link, customize the look and copy, and export everything as either individual images or a print-ready PDF.

This is a collaborative repo for the Ambassador and events community. Feedback, improvements, and contributions are open and very welcome.

## What The App Does

- Upload a CSV file of redeem links provided by the Cursor team
- Paste extra redeem links manually in the app when you only need a few or want to supplement a CSV
- Read the links from the first column and generate one QR card per link
- Apply Cursor branding to a front and back card design
- Customize the card theme with light or dark variants
- Choose the QR style: pixelated or dotted
- Switch card copy between English and Spanish
- Add a custom event or city name to the back of the card
- Export all fronts as PNG files plus the shared back image in a ZIP
- Export a print-ready PDF with configurable paper size, orientation, margins, gaps, and card width

## Typical Workflow

1. Get the CSV file with redeem links from the Cursor team.
2. Upload it into the app and optionally paste any additional redeem links manually.
3. Review the generated cards and customize the theme, language, QR style, and event or city name.
4. Export either:
   - a ZIP with all card images, or
   - a PDF laid out for printing, including both front and back sides.

## CSV Format

The app expects the redeem URLs in the first column of the CSV.

- A header row is okay
- Empty rows are ignored
- Extra columns are ignored
- Each valid row should contain a full `http` or `https` redeem link

Example:

```csv
url
https://cursor.com/redeem/abc123
https://cursor.com/redeem/def456
```

## Manual Links

You can also paste redeem links directly into the app.

- One full `http` or `https` redeem URL per line
- Empty lines are ignored
- Manual links are combined with any uploaded CSV links

## Export Options

### ZIP Export

Downloads one PNG per front card plus a shared `back.png` file.

### PDF Export

Creates a document ready to print, with controls for:

- paper size presets or custom page dimensions
- portrait or landscape orientation
- page margins
- gaps between cards
- card width

The card height is calculated automatically to preserve the design ratio.

## Local Development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Contributing

This repo is meant to be improved collaboratively by Cursor Ambassadors, event hosts, and anyone helping make physical code distribution easier.

Issues and pull requests are welcome for things like:

- additional language support
- new card layouts or print presets
- export improvements
- accessibility and UI polish
- bug fixes and workflow improvements
