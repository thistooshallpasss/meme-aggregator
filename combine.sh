#!/bin/bash

# Output file
OUTPUT_FILE="copy.txt"

# Clear output file
> "$OUTPUT_FILE"

echo "Project ka code aur structure '$OUTPUT_FILE' mein daala jaa raha hai..."

# Directories to process
for dir in frontend backend; do
  if [ ! -d "$dir" ]; then
    echo "⚠️  Directory '$dir' does not exist. Skipping..."
    continue
  fi

  # 1️⃣ Directory tree (ignore node_modules & package-lock.json)
  echo "// ----- DIRECTORY STRUCTURE: $dir -----" >> "$OUTPUT_FILE"
  if command -v tree >/dev/null 2>&1; then
      tree "$dir" -I "node_modules|package-lock.json" >> "$OUTPUT_FILE"
  else
      # Agar tree command available nahi hai, fallback
      find "$dir" -type d -not -path "*/node_modules/*" | sed "s|^|├─ |" >> "$OUTPUT_FILE"
  fi
  echo "" >> "$OUTPUT_FILE"

  # 2️⃣ Files content (ignore node_modules & package-lock.json)
  find "$dir" -type f \
    -not -path "*/node_modules/*" \
    -not -name "package-lock.json" \
    -not -path "./$OUTPUT_FILE" | while IFS= read -r file; do

      echo "// ----- START FILE: $file -----" >> "$OUTPUT_FILE"
      cat "$file" >> "$OUTPUT_FILE"
      echo "" >> "$OUTPUT_FILE"
      echo "// ----- END FILE: $file -----" >> "$OUTPUT_FILE"
      echo "" >> "$OUTPUT_FILE"
  done

done

echo "✅ Kaam poora ho gaya!"
echo "Ab '$OUTPUT_FILE' file ka poora content copy karke paste karein."
