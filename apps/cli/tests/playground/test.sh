./clean



# Artifact tools


./ofm inspect ../fixtures/pet-addendum.pdf

./ofm inspect ../fixtures/pet-addendum-bindings.pdf

./ofm validate ../fixtures/pet-addendum.yaml
./ofm validate ../fixtures/pet-addendum-md.yaml
./ofm validate ../fixtures/pet-addendum-docx.yaml
./ofm validate ../fixtures/pet-addendum-pdf.yaml
./ofm validate ../fixtures/pet-addendum-pdf-bindings.yaml


./ofm render ../fixtures/pet-addendum.yaml --data '{"name":"Fluffy","species":"cat","weight":3,"hasVaccination":true}'

./ofm render ../fixtures/pet-addendum.yaml --data '{"name":"Fluffy","species":"cat","weight":3,"hasVaccination":true}' > ./temp.md

./ofm render ../fixtures/pet-addendum.yaml --data '{"name":"Fluffy","species":"cat","weight":3,"hasVaccination":true}' --out ./output-inline.md

./ofm render ../fixtures/pet-addendum-md.yaml --data '{"name":"Fluffy","species":"cat","weight":3,"hasVaccination":true}' --out ./output.md

./ofm render ../fixtures/pet-addendum-docx.yaml --data '{"name":"Fluffy","species":"cat","weight":3,"hasVaccination":true}' --out ./output.docx

./ofm render ../fixtures/pet-addendum-pdf.yaml --data '{"name":"Fluffy","species":"cat","weight":3,"hasVaccination":true}' --out ./output.pdf

./ofm render ../fixtures/pet-addendum-pdf-bindings.yaml --data '{"name":"Fluffy","species":"cat","weight":3,"hasVaccination":true}' --bindings ../fixtures/bindings.json --out ./output-bindings.pdf




# Data commands
ofm data template ../../fixtures/pet-addendum.yaml --out ./help.yaml
ofm data validate ../../fixtures/pet-addendum.yaml ./help.yaml
ofm data fill ../../fixtures/pet-addendum.yaml --out ./answers.yaml

# Artifact commands
ofm inspect ../../fixtures/pet-addendum.pdf

# Remote commands
ofm remote add origin https://github.com/open-form/pet-addendum
ofm remote view
ofm remote set-url origin https://github.com/open-form/pet-addendum
ofm remote rename origin old
ofm remote remove old

# Sync commands
ofm push origin
ofm push origin