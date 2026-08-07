# 6-Month Roadmap: Full-Stack Engineer → Founding Engineer / FDE (AI + Computer Vision)

**Built for:** BSCS grad, strong full-stack (JS/TS, React/Next.js, Node, APIs, DBs, Docker), new RTX 5060 Ti 16GB rig.
**Not for:** becoming an ML researcher or data scientist.
**Target:** "Give me a customer problem — I'll build the prototype, deploy it, measure it, and iterate with the customer."

---

## 1. My Target Profile

By month 6 you should be describable, truthfully, as:

> A full-stack engineer who ships end-to-end AI/CV products — from a raw customer problem to a trained/fine-tuned model, GPU-optimized inference, a production API and dashboard, deployed and monitored — and who can run the customer conversation that got the project scoped in the first place.

This is a **T-shaped profile**:
- **Horizontal bar (deep):** full-stack product engineering — you already have this.
- **Vertical spike (new):** applied CV + GPU inference optimization + model serving.
- **Second horizontal layer (new):** customer-facing technical discovery and PoC delivery (the FDE layer).

Target companies are seed/Series A AI startups (5–40 people) who need one engineer who can own a vertical slice, and enterprise AI vendors who need FDEs to sit with customers and ship PoCs in days, not quarters. You are explicitly **not** competing with PhD ML researchers — you're competing with engineers who can talk to a customer, scope a PoC, and ship it in a sprint.

---

## 2. Skill Gap Analysis

| Area | Current | Gap | Priority |
|---|---|---|---|
| Full-stack (React/Next/Node/Postgres/Docker) | Strong | Adapt to AI-serving patterns (streaming, queues, GPU-aware infra) | Low — refresh only |
| Python | Weak/rusty (assumed) | Needs to be fluent, not just "can write scripts" | High |
| Computer Vision (OpenCV, CNNs, detection, segmentation, tracking) | None | Full curriculum needed, but applied not theoretical | Critical |
| PyTorch | None | Training loops, fine-tuning, transfer learning | Critical |
| GPU/CUDA/inference optimization (FP16/INT8, ONNX, TensorRT) | None | This is your biggest differentiator vs. bootcamp-AI engineers | Critical |
| Model serving/production AI infra | None | FastAPI + model serving patterns, batching, queuing | High |
| Cloud (AWS) for AI workloads | Some general cloud exposure assumed | GPU instances, cost control, deployment of inference services | Medium-High |
| Customer discovery / FDE skills | None formal | This is what actually gets you hired over a stronger ML engineer | Critical |
| Founding engineer judgment (build vs buy, MVP scoping, cost awareness) | Some, from full-stack work | Needs AI-specific cost/latency tradeoff intuition | Medium |
| Personal brand / portfolio for this niche | Generic dev profile | Needs a flagship AI product + build-in-public track record | Critical |

**Ruthless prioritization rule used throughout this plan:** every hour goes to CV fundamentals → GPU optimization → shipping the flagship product → FDE/customer skills → distribution (LinkedIn/network). Math, research papers, and "learn everything" detours are explicitly cut.

---

## 3. 6-Month Roadmap (Overview)

| Month | Theme | Outcome |
|---|---|---|
| **1** | Python + CV foundations + GPU rig online | Can classify/detect objects in images with OpenCV + PyTorch, GPU environment fully working, CUDA basics understood |
| **2** | Detection/tracking/video + first fine-tune | Can fine-tune YOLO on a custom dataset, run object tracking on video, understand training/eval loop end-to-end |
| **3** | GPU inference optimization + serving | Can export to ONNX/TensorRT, benchmark FP32 vs FP16 vs INT8, serve a model via FastAPI with real latency/FPS numbers |
| **4** | Flagship project: build | Full-stack AI product (model + API + DB + frontend + Docker) 80% built, deployed to a real environment |
| **5** | Flagship project: polish + FDE motion starts | Project demo-ready, case study written, first PoC-style conversations happening with real people |
| **6** | Job search push | Applications, interviews, 1–2 more PoC conversations converted to real interviews/offers, portfolio + LinkedIn fully positioned |

Weekday budget: **2–3 hrs/day** (Mon–Fri) = ~12.5–15 hrs/week.
Weekend budget: **4–6 hrs/day** = ~8–12 hrs/weekend.
**Total: ~20–27 hrs/week**, ~500–600 hrs over 6 months. This is realistic for someone working full-time — it is not a "quit your job and grind 60 hrs/week" plan, and the schedule below is built to survive bad weeks.

---

## 4. Month-by-Month Plan

### Month 1 — Python fluency, CV foundations, GPU environment
- **Weeks 1–2:** Python fluency refresh (fast — you already think like an engineer), NumPy, environment setup (CUDA drivers, PyTorch install, verify GPU works), OpenCV basics (image I/O, transforms, filtering).
- **Weeks 3–4:** CNN fundamentals (conceptual, not derivation-heavy), image classification with PyTorch on a real dataset, first end-to-end train/eval/save/load loop on your own GPU.
- **Deliverable:** A working local dev environment + a classifier trained on your GPU with logged accuracy/loss curves, pushed to GitHub.

### Month 2 — Detection, tracking, video, first real fine-tune
- **Weeks 5–6:** Object detection theory-lite + YOLO (Ultralytics), run inference on pretrained weights, understand anchors/NMS/mAP at a practical level.
- **Weeks 7–8:** Fine-tune YOLO on a custom/small dataset (label it yourself with a tool — this matters for interviews), add object tracking (ByteTrack/DeepSORT) on video, basic segmentation exposure (SAM or a lightweight segmentation model).
- **Deliverable:** A custom-trained detection model + a tracking demo on real video, with before/after fine-tuning metrics documented.

### Month 3 — GPU optimization + serving (your key differentiator)
- **Weeks 9–10:** CUDA fundamentals conceptually (cores vs tensor cores, memory hierarchy, why FP16/INT8 matter), PyTorch AMP, export to ONNX.
- **Weeks 11–12:** TensorRT conversion, INT8 calibration basics, GPU profiling (Nsight Systems or `torch.profiler`), FastAPI model-serving service with real latency/FPS benchmark tables (FP32 vs FP16 vs TensorRT INT8).
- **Deliverable:** A benchmark report/table + blog-style writeup: "I took inference from X ms to Y ms on an RTX 5060 Ti" — this single artifact will do more for your credibility than any course certificate.

### Month 4 — Flagship product build (heaviest month)
- Full-stack integration: model → FastAPI → Postgres → Next.js dashboard → Docker Compose → deployed to AWS (or a GPU cloud instance for inference + a normal instance for the app).
- WebSockets for live video/stream results if the product calls for it.
- Auth, logging, basic monitoring wired in from day one — not bolted on later.
- **Deliverable:** A deployed, demoable v1 of the flagship product with a real (if narrow) customer use case.

### Month 5 — Polish, case study, FDE motion begins
- Weeks 17–18: harden the product (error handling, edge cases, a second dataset or use-case variant, cost analysis of running it), record a 2–3 minute demo video.
- Weeks 19–20: write the full case study (problem → approach → architecture → results → cost → what you'd do with more time), finish 2–3 supporting projects, start actively reaching out to founders for PoC-style conversations (see Section 17).
- **Deliverable:** Full portfolio (flagship + case study + supporting projects) live and linked from LinkedIn/GitHub/resume.

### Month 6 — Job search push
- Applications go out in volume, interview prep runs in parallel (system design, CV technical, FDE/behavioral), networking conversations convert into referrals, and if a PoC conversation is going well you push it toward a paid trial or contract-to-hire.
- **Deliverable:** Active interview pipeline; the goal state is "in final rounds or negotiating" by end of week 26, not necessarily signed — hiring timelines vary and you should keep applying through this month regardless of pipeline status.

---

## 5. Week-by-Week Plan

Each week below follows the same 8-part structure you asked for. Weeks repeat this pattern for the full 26 weeks — I've written out Weeks 1–12 in full detail (Months 1–3, your technical foundation) and then given the Month 4–6 weeks in a tighter format since their content is driven by your specific flagship project choice rather than a fixed curriculum.

### WEEK 1 — Environment + Python refresh
1. **Learn:** Python idioms you don't use daily as a JS dev (list/dict comprehensions, generators, context managers, `venv`), NumPy array basics (shape, broadcasting, indexing, vectorization).
2. **Build:** Set up PyTorch + CUDA on the RTX 5060 Ti, verify with `torch.cuda.is_available()`, write a NumPy-vs-Python-loop benchmark script to *feel* why vectorization matters.
3. **Benchmark:** GPU detected correctly, CUDA version compatible with PyTorch build, NumPy op ~50-100x faster than pure Python loop.
4. **GitHub:** Repo `ai-cv-journey` created; commit env setup notes (`SETUP.md`) + NumPy benchmark script.
5. **LinkedIn post:** "I bought an RTX 5060 Ti to go all-in on computer vision engineering. Here's the setup, and here's the target: full AI products, not just notebooks. Day 1." (photo of GPU/rig, short and confident, no fluff.)
6. **Network:** Follow + lightly engage (thoughtful comment, not "Great post!") with 5 Founding Engineers/FDEs at AI startups. Don't message yet — just get on their radar.
7. **FDE/job skill:** Nothing formal yet — this week is pure setup.
8. **Definition of Done:** GPU verified working end to end; repo live; first post published.

### WEEK 2 — OpenCV basics
1. **Learn:** OpenCV fundamentals — image I/O, color spaces, resizing, filtering, thresholding, contours, drawing. Resource: OpenCV's official Python tutorials (not a paid course — the docs are genuinely good for this level).
2. **Build:** A small OpenCV pipeline: read webcam/video → grayscale → edge detection → contour count overlay, in real time.
3. **Benchmark:** FPS of your live pipeline on CPU (baseline you'll compare against once GPU inference comes in later).
4. **GitHub:** `01_opencv_basics/` folder, real-time script + README with example output GIF.
5. **LinkedIn post:** Short screen-recording GIF of your real-time OpenCV pipeline. Caption: what it does, what surprised you (e.g., "contour detection is way more finicky on real-world lighting than tutorials show").
6. **Network:** Send 3 short, specific connection requests (see Section 16 for exact scripts) to people building AI products.
7. **FDE/job skill:** Start a "problem log" — a running doc where you write down 1 real-world problem per week that CV could plausibly solve. This becomes your flagship-project idea pool.
8. **Definition of Done:** Real-time OpenCV script runs at usable FPS; post published; 3 connection requests sent.

### WEEK 3 — CNNs conceptually + first classifier (part 1)
1. **Learn:** CNN fundamentals at the *engineering* level — what convolution/pooling actually do, why CNNs beat plain MLPs on images, transfer learning concept. Skip backprop derivations and research-paper math; you need intuition, not proofs.
2. **Build:** Load a pretrained ResNet/EfficientNet in PyTorch, run inference on your own photos, then set up a small custom classification dataset (5-10 classes, few hundred images — can be personal, e.g., "types of tools in my kitchen").
3. **Benchmark:** Pretrained model inference time on CPU vs GPU on your machine — first real "why GPU matters" number.
4. **GitHub:** `02_classification/` with dataset prep script + inference notebook.
5. **LinkedIn post:** "Ran the same model on CPU vs my new GPU. Xms → Yms. This is why I bought this card." Simple, concrete, numbers-driven.
6. **Network:** Comment meaningfully on 5 posts from FDEs/founders; DM 2 people from your "watch list" with a genuine question (not a pitch).
7. **FDE/job skill:** Read 2-3 real FDE/Applied AI Engineer job descriptions and copy the recurring language into a doc — this vocabulary matters for your LinkedIn headline later.
8. **Definition of Done:** Pretrained inference working on GPU with logged CPU-vs-GPU numbers; custom dataset collected and organized in `train/val` folders.

### WEEK 4 — First classifier (part 2) + training loop mastery
1. **Learn:** PyTorch training loop anatomy (dataset/dataloader, loss, optimizer, scheduler, train/val split, overfitting signs), data augmentation basics (flips, crops, color jitter) via `torchvision.transforms`.
2. **Build:** Fine-tune your pretrained model on your custom dataset from Week 3. Log loss/accuracy per epoch. Add augmentation and compare results with/without it.
3. **Benchmark:** Accuracy with vs. without augmentation; training time per epoch on your GPU.
4. **GitHub:** Full classifier project finished — training script, saved weights, README with accuracy curves (matplotlib plots committed as images).
5. **LinkedIn post:** "Trained my first custom image classifier end-to-end on my own GPU. Here's what augmentation actually changed (with numbers)." Include the plot.
6. **Network:** 5 new connection requests; follow up with anyone from Weeks 2–3 who replied.
7. **FDE/job skill:** Draft a rough "who is my ideal target company" list (10 startups) using your job-description vocabulary from Week 3.
8. **Definition of Done:** Custom classifier trained, evaluated, and documented with real metrics; Month 1 GitHub portfolio has 4 clean, documented mini-projects.

> **Month 1 checkpoint:** You should now be comfortable in PyTorch, understand the train/eval loop cold, have a working GPU dev environment, and have posted 4 times on LinkedIn with real artifacts (not opinions).

### WEEK 5 — Object detection theory-lite + pretrained YOLO
1. **Learn:** Detection vs classification, bounding boxes, IoU, NMS, mAP as a metric (understand what it means, don't derive it), YOLO architecture at a conceptual level.
2. **Build:** Run Ultralytics YOLOv8/v11 pretrained inference on images and video; visualize boxes + confidence scores.
3. **Benchmark:** FPS on video for different YOLO model sizes (nano vs small vs medium) on your GPU — first model-size-vs-speed tradeoff table.
4. **GitHub:** `03_detection/` with inference script + FPS comparison table.
5. **LinkedIn post:** Video clip of YOLO running on a real scene (street, room, whatever) with the FPS table as an image. "Nano vs Medium YOLO on an RTX 5060 Ti — here's the tradeoff."
6. **Network:** DM 2 founders whose product touches CV/vision with a specific, non-pitchy observation about their product.
7. **FDE/job skill:** Write your "elevator pitch" (3 sentences: who you are, what you're building toward, what makes you different) — you'll refine this all the way through Month 6.
8. **Definition of Done:** Multiple YOLO variants benchmarked and documented; pitch drafted.

### WEEK 6 — Dataset labeling + custom fine-tune (part 1)
1. **Learn:** Dataset prep for detection (YOLO format), labeling tools (Roboflow or CVAT), what makes a good detection dataset (class balance, image diversity, annotation quality).
2. **Build:** Pick your flagship project's rough domain now (see Section 12 — decide this week, don't drift). Collect and label 200-500 images for it using Roboflow.
3. **Benchmark:** Class distribution stats on your dataset; note imbalance issues if any.
4. **GitHub:** `flagship-project/` repo created; dataset prep + labeling workflow documented.
5. **LinkedIn post:** "Spent the weekend labeling my own dataset by hand. Nobody tells you this is 40% of the real work." Include a labeling screenshot.
6. **Network:** 5 new connections; ask 1 person for a 15-minute call (see Section 16 script).
7. **FDE/job skill:** Practice explaining your flagship idea out loud in 60 seconds to a non-technical friend/family member; refine based on confusion points.
8. **Definition of Done:** Labeled dataset ready in YOLO format, split into train/val; flagship domain locked in.

### WEEK 7 — Custom fine-tune (part 2) + evaluation
1. **Learn:** Fine-tuning YOLO on custom classes, evaluation metrics (precision/recall/mAP per class), reading a confusion matrix for detection.
2. **Build:** Fine-tune YOLO on your labeled dataset; evaluate before/after vs. the pretrained baseline (which likely doesn't know your custom classes at all).
3. **Benchmark:** mAP@0.5, precision, recall per class; inference FPS on the fine-tuned model.
4. **GitHub:** Fine-tuning script + eval results committed with metrics table.
5. **LinkedIn post:** "Fine-tuned YOLO on a dataset I labeled myself. Baseline: can't detect these classes at all. After fine-tuning: X mAP." Concrete before/after.
6. **Network:** Follow up with anyone who hasn't responded (polite, no guilt-tripping — see Section 16); 1 new call booked if possible.
7. **FDE/job skill:** Read one real "customer discovery" resource (see Section 10) and write 5 discovery questions you'd ask a customer about your flagship domain.
8. **Definition of Done:** Fine-tuned model with documented metrics beating the "can't detect at all" baseline meaningfully.

### WEEK 8 — Tracking + video processing
1. **Learn:** Object tracking concepts (tracking-by-detection, ID persistence across frames), ByteTrack or a similarly simple tracker, video I/O performance considerations (reading, writing, buffering).
2. **Build:** Add tracking on top of your fine-tuned detector — persistent IDs across a video, basic counting/zone logic if relevant to your flagship idea.
3. **Benchmark:** End-to-end FPS with detection + tracking combined (this number will usually drop — document why).
4. **GitHub:** Tracking module added to flagship repo with demo video/GIF.
5. **LinkedIn post:** GIF of tracking with persistent IDs on real footage. "Detection was the easy part. Tracking across frames without IDs swapping is where it got interesting."
6. **Network:** 5 new connections; comment thoughtfully on 5 more posts.
7. **FDE/job skill:** Write a 1-page "PoC offer" — a short, concrete offer you could send a startup ("I'll build you a working prototype of X in a week, free, in exchange for feedback") — you'll use this starting Month 5.
8. **Definition of Done:** Tracking working reliably on sample video; Month 2 checkpoint reached.

> **Month 2 checkpoint:** You can label data, fine-tune a detector, evaluate it properly, and add tracking. You have a real (if early) flagship project underway and a growing, engaged LinkedIn following.

### WEEK 9 — CUDA fundamentals + mixed precision
1. **Learn:** CUDA cores vs Tensor Cores (what they're for, why Tensor Cores matter for AI specifically), GPU memory basics (VRAM usage, why 16GB matters for you), FP32 vs FP16 vs INT8 conceptually, PyTorch Automatic Mixed Precision (AMP).
2. **Build:** Re-run your classifier/detector training with AMP enabled; compare training time and memory usage vs FP32.
3. **Benchmark:** Training time, VRAM usage, and accuracy: FP32 vs AMP (FP16) — a clean before/after table.
4. **GitHub:** `04_gpu_optimization/` folder with AMP comparison script + results.
5. **LinkedIn post:** "Enabled mixed precision training. Same accuracy, Xs → Ys training time, GB → GB VRAM. Free lunch, mostly." Table as image.
6. **Network:** 5 new connections; 1 call booked/held if scheduled.
7. **FDE/job skill:** Study 1 real technical-feasibility-analysis framework (see Section 10) and apply it to your own flagship idea in writing.
8. **Definition of Done:** AMP training working with documented speed/memory gains and no meaningful accuracy loss.

### WEEK 10 — ONNX export
1. **Learn:** Why ONNX exists (framework-agnostic inference format), ONNX export process from PyTorch, ONNX Runtime basics, common export pitfalls (dynamic shapes, unsupported ops).
2. **Build:** Export your fine-tuned detector to ONNX; run inference via ONNX Runtime and compare to native PyTorch inference.
3. **Benchmark:** Native PyTorch vs ONNX Runtime inference latency, on identical inputs, same GPU.
4. **GitHub:** Export script + ONNX Runtime inference script + latency comparison.
5. **LinkedIn post:** "PyTorch inference vs ONNX Runtime — same model, different runtime. Xms vs Yms." Explain briefly why this matters for production.
6. **Network:** 5 new connections; follow up on any warm conversations.
7. **FDE/job skill:** Draft your resume's "Projects" section around the flagship project as it stands now (you'll keep updating it).
8. **Definition of Done:** Working ONNX export + benchmark; model portable outside PyTorch.

### WEEK 11 — TensorRT + INT8
1. **Learn:** TensorRT's role (NVIDIA-specific graph/kernel optimization), FP16 vs INT8 TensorRT engines, calibration for INT8 (why it needs representative data), tradeoffs (accuracy vs speed).
2. **Build:** Convert your ONNX model to a TensorRT engine (FP16 first, then attempt INT8 with calibration data from your dataset). This is the hardest technical week in the plan — budget extra weekend time.
3. **Benchmark:** The full ladder: PyTorch FP32 → ONNX Runtime → TensorRT FP16 → TensorRT INT8, latency and FPS at each step, plus accuracy/mAP delta for INT8.
4. **GitHub:** TensorRT conversion scripts + the full benchmark ladder as a table/chart — **this becomes one of your single best portfolio artifacts.**
5. **LinkedIn post:** The full ladder chart. "Took inference from Xms (PyTorch FP32) to Yms (TensorRT INT8) on an RTX 5060 Ti. Z% accuracy tradeoff. Full writeup + code linked." This post should be one of your best-performing ones — treat it like a mini technical blog post.
6. **Network:** 5 new connections; this is a strong week to reach out to people specifically working on inference optimization/edge AI — the post gives you real credibility to open with.
7. **FDE/job skill:** Study 1 GPU inference cost-optimization framework (spot vs on-demand, batching, model size vs accuracy tradeoffs for cost) — write a short doc applying it to your flagship model.
8. **Definition of Done:** Full FP32→TensorRT INT8 benchmark ladder complete, documented, and posted.

### WEEK 12 — GPU profiling + FastAPI serving
1. **Learn:** `torch.profiler` or NVIDIA Nsight Systems basics (finding bottlenecks — is it CPU preprocessing, GPU compute, or data transfer?), FastAPI basics for serving ML models (async endpoints, request batching concept, background tasks).
2. **Build:** Profile your inference pipeline to find the actual bottleneck (often it's image preprocessing/postprocessing on CPU, not the model itself — a genuinely valuable thing to discover firsthand). Then wrap your best-performing model (TensorRT engine) in a FastAPI endpoint that accepts an image/video frame and returns detections.
3. **Benchmark:** End-to-end request latency through the API (not just model inference — the *whole* round trip), plus identification of your top bottleneck from profiling.
4. **GitHub:** `05_serving/` — FastAPI app + profiling output + writeup of what the bottleneck was and whether you fixed it.
5. **LinkedIn post:** "Profiled my inference pipeline and the model wasn't the bottleneck — [X] was. Here's what I changed." This kind of "surprising finding" post performs well and shows real engineering maturity.
6. **Network:** 5 new connections; by now you should have 1-2 recurring conversations going — nurture those specifically this week.
7. **FDE/job skill:** Mock-run a "customer call" with a friend using your discovery questions from Week 7 — treat it seriously, take notes, debrief afterward.
8. **Definition of Done:** Working FastAPI serving endpoint using your optimized model; profiling bottleneck identified and documented; Month 3 checkpoint reached.

> **Month 3 checkpoint:** This is your technical foundation complete. You can train, fine-tune, evaluate, optimize (FP16/INT8, ONNX, TensorRT), profile, and serve a CV model via API. Everything from here is about turning this into a real, deployed, customer-facing product and getting in front of people.

### WEEKS 13–16 (Month 4) — Flagship build sprint
Each week follows the same 8-part structure; content is dictated by your specific flagship spec (Section 12), so instead of a fixed curriculum:
- **Week 13:** Backend architecture — Postgres schema, FastAPI endpoints beyond inference (auth, CRUD, job queue if async processing needed), Docker Compose skeleton for the whole stack.
- **Week 14:** Model integration into the real backend (not a notebook — production code paths, error handling, input validation, logging).
- **Week 15:** Frontend/dashboard in Next.js — upload/stream input, show results, basic auth, connect to your API (WebSocket if live video).
- **Week 16:** Deploy the full stack (GPU inference component + app) to AWS or a GPU cloud provider; wire up basic monitoring (uptime, latency, error rate) and cost tracking.
- **LinkedIn/GitHub:** post progress weekly — "backend live," "dashboard connected," "first deploy" — build-in-public, not a single reveal at the end.
- **Network:** maintain 5 new connections/week minimum; this is also when you start warm-introducing your flagship idea to 1-2 people per week for early feedback.
- **FDE/job skill:** each week, have one real conversation (call or async) where you explain the flagship project to someone outside your head — collect objections and feature requests like a real PM would.
- **Definition of Done (end of Month 4):** Flagship product is deployed and functional end-to-end, even if rough around the edges.

### WEEKS 17–20 (Month 5) — Polish, case study, PoC outreach
- **Week 17:** Harden the product — edge cases, error states, a second use-case or dataset variant to show generality, revisit cost numbers with real usage.
- **Week 18:** Record a 2–3 minute demo video (screen recording + voiceover, not a script read robotically); write the full case study document.
- **Week 19:** Finish 2–3 supporting projects (see Section 13) if not already done; make sure GitHub READMEs across all repos meet the bar in Section 14.
- **Week 20:** Start the PoC offer motion for real — send your Week-8 "PoC offer" doc to 5–10 specific startups/founders whose problems match your flagship domain (see Section 17).
- **LinkedIn:** demo video post, case study post (can be a carousel/thread), "I'm opening up 2 free PoC slots this month" post.
- **Network:** shift some volume from cold connections to warm conversations — quality over quantity from here.
- **FDE/job skill:** run at least 1 real discovery call with a startup that responds to your PoC offer.
- **Definition of Done (end of Month 5):** Full portfolio live and polished; at least 1 real PoC conversation in progress with an external company.

### WEEKS 21–26 (Month 6) — Job search push
- **Week 21:** Finalize resume + LinkedIn headline/About around your now-complete portfolio; build target company list to 30-40 (Section 18); start applications (10-15/week).
- **Week 22:** Continue applications; begin system design + CV technical interview prep (Section 19); keep any active PoC conversation moving.
- **Week 23:** Continue applications; mock interviews (technical + behavioral + "customer scenario" role-plays); FDE-style case interview prep.
- **Week 24:** First real interview loops likely starting; keep networking (referrals convert far better than cold applications); if a PoC has gone well, propose a paid trial or contract-to-hire.
- **Week 25:** Interview loops continue; negotiate if offers arrive; keep a steady trickle of applications going (don't stop just because one pipeline looks promising).
- **Week 26:** Consolidate — either you're closing an offer, in final rounds, or you extend the search using the exact same system (portfolio + network + PoCs are now durable assets, not one-time sprint work).
- **Definition of Done (end of Month 6):** Active final-round interviews and/or an offer in hand; if not, a durable, working system (network + content + portfolio + PoC pipeline) that keeps generating opportunities beyond month 6.

---

## 6. Daily Study Schedule (Template)

You don't need a different schedule every day — you need one good template you actually follow.

**Weekdays (2–3 hrs, e.g., 7–9:30pm):**
- 15 min: review yesterday's stopping point / re-read notes
- 90–120 min: focused build/learn block (deep work, phone away, one task only)
- 15–20 min: commit to GitHub + update problem log or LinkedIn draft
- 10 min: check/answer 2-3 LinkedIn network messages (not doomscroll)

**Weekends (4–6 hrs/day, split into 2 blocks):**
- **Block 1 (morning, ~2.5–3 hrs):** the week's hardest technical task (fine-tuning, TensorRT conversion, deployment) — do this when your brain is freshest.
- **Break**
- **Block 2 (afternoon, ~2–3 hrs):** writing (LinkedIn post, case study, README), networking (calls, DMs, follow-ups), lighter integration work.

**Non-negotiables:**
- Never end a session without committing something to GitHub, even messy.
- Never let more than 2 days pass without a LinkedIn touchpoint (post, comment, or DM) — consistency beats intensity here.
- If a week goes badly (life happens), protect the GPU-optimization and flagship-build weeks first; conceptual weeks (CNN theory, tracking theory) are the safest to compress.

---

## 7. Computer Vision Curriculum

Only the resources that earn their place. One primary resource per topic, with what to actually study.

| Topic | Resource | Study | Skip | Project after |
|---|---|---|---|---|
| Python for CV / NumPy | Official NumPy docs "Absolute Beginners" + "Quickstart" guides | Array creation, indexing/slicing, broadcasting, vectorized ops | Advanced linear algebra routines you won't use yet | NumPy vs loop benchmark (Week 1) |
| OpenCV | OpenCV official Python tutorials (docs.opencv.org) | Image I/O, color spaces, filtering, thresholding, contours, video capture | GUI-heavy desktop app tutorials, C++ sections | Real-time webcam pipeline (Week 2) |
| CNNs / deep learning intuition | PyTorch official "Deep Learning with PyTorch: A 60 Minute Blitz" + torchvision transfer-learning tutorial | Tensors, autograd conceptually, a full train loop, transfer learning | Full backprop math derivation, building a CNN from raw ops | Custom classifier (Weeks 3–4) |
| Object detection / YOLO | Ultralytics official docs + GitHub repo | Inference, training config, dataset YAML format, exporting | Reading the full YOLO paper line-by-line | Pretrained + fine-tuned detector (Weeks 5–7) |
| Dataset labeling | Roboflow's own docs/workflow | Annotation workflow, export formats, augmentation presets built into the tool | Building your own labeling tool | Labeled custom dataset (Week 6) |
| Tracking | ByteTrack GitHub repo (README + example usage) | How IDs are assigned/maintained, integrating with a detector's output | The full academic paper's ablation studies | Tracking demo (Week 8) |
| Segmentation (light exposure) | Meta's Segment Anything (SAM) official repo/demo | Prompt-based segmentation basics, when it's useful vs overkill | Training SAM from scratch (not the point) | Optional add-on to flagship if relevant |

**Guiding principle:** every resource above is official documentation or an official repo — no random Udemy courses, no outdated blog tutorials from 2019 that reference deprecated APIs.

---

## 8. CUDA + TensorRT Curriculum

| Topic | Resource | Study | Skip | Project after |
|---|---|---|---|---|
| CUDA/GPU fundamentals | NVIDIA's "CUDA Refresher" blog series (developer.nvidia.com) + PyTorch CUDA semantics docs | Cores vs Tensor Cores, memory hierarchy basics, why parallelism helps AI workloads | Writing raw CUDA kernels yourself (not your job as an FDE) | None — conceptual only, feeds Week 9 |
| Mixed precision | PyTorch official AMP docs/tutorial | `autocast`, `GradScaler`, when FP16 helps vs hurts | Manual loss-scaling implementation details | AMP before/after benchmark (Week 9) |
| ONNX | Official ONNX + ONNX Runtime docs ("Export PyTorch model to ONNX") | Export process, dynamic axes, ONNX Runtime inference session | ONNX's full operator spec | ONNX export + benchmark (Week 10) |
| TensorRT | NVIDIA's official TensorRT documentation + "torch2trt" or `trtexec` quickstart | Engine building, FP16 flag, INT8 calibration workflow | Writing custom TensorRT plugins | Full FP32→TensorRT ladder benchmark (Week 11) |
| Profiling | PyTorch Profiler official docs (`torch.profiler`) | Reading a trace, identifying CPU vs GPU vs data-loading bottlenecks | Nsight Systems deep GUI mastery (nice-to-have, not required) | Bottleneck analysis writeup (Week 12) |

This ladder — FP32 → AMP → ONNX → TensorRT FP16 → TensorRT INT8, with real numbers on your own GPU — is the single most differentiating technical artifact in this entire roadmap. Most full-stack-turned-AI engineers never touch this. Most ML-research-track engineers never touch production serving. You'll have done both.

---

## 9. Production AI Engineering Curriculum

You already know FastAPI/Node/Postgres/Docker patterns generally — this section is specifically the **AI-serving-specific** layer on top of what you know.

| Topic | Resource | Study | Skip | Project after |
|---|---|---|---|---|
| FastAPI for ML serving | Official FastAPI docs, sections on async, background tasks, file uploads, WebSockets | Async endpoints, streaming responses, WebSocket basics for live video/results | Full framework tour (you know the patterns already) | Serving endpoint (Week 12) |
| Model serving patterns | NVIDIA Triton Inference Server docs (read-only exposure, don't need to fully deploy it) | Concepts: batching, dynamic batching, model versioning, multi-model serving | Full Triton deployment (overkill for a solo flagship project unless it becomes the differentiator) | Conceptual only — informs your FastAPI architecture decisions |
| Cloud for AI (AWS) | AWS official docs: EC2 GPU instances (g4dn/g5), S3, basic IAM | Spinning up/down GPU instances, storing model weights/datasets in S3, cost basics of on-demand GPU instances | Full AWS certification scope — you need "can deploy and control cost," not "can pass SAA-C03" | Flagship deployment (Month 4) |
| Monitoring/logging | Your existing Node/full-stack logging knowledge + Prometheus/Grafana quickstart (or a lighter tool like Better Stack) if time allows | Latency, error rate, and (for AI specifically) inference time + GPU utilization as tracked metrics | Building a full observability stack from scratch | Monitoring wired into flagship (Week 16) |

---

## 10. FDE Curriculum

This is the track that actually differentiates you from "another AI engineer." Study it like you'd study a technical curriculum — it is a skill, not a personality trait.

| Topic | Resource | Study | Skip | Practical task |
|---|---|---|---|---|
| Customer discovery | Rob Fitzpatrick's *The Mom Test* (short book, highly practical, industry-standard for exactly this) | The core rule: ask about their past behavior, not opinions about your idea; how to run a discovery conversation without leading the witness | Heavier lean-startup theory books — this one book covers what you need | Draft 5 real discovery questions (Week 7) |
| Translating business → technical problems | Any strong "PoC scoping" writeup from an FDE at a recognizable AI infra company (search current FDE blog posts from companies like Palantir-style FDE programs) — use current search, this space moves fast | How to turn "we want AI to help with X" into a scoped, buildable technical spec with success criteria | Generic product-management frameworks not specific to technical PoCs | Feasibility framework applied to your flagship idea (Week 9) |
| Rapid prototyping / PoC delivery | Your own flagship project *is* this curriculum — the real skill is doing it under time pressure with a stranger's requirements, not reading about it | — | — | The PoC offer motion itself (Month 5–6) |
| Communicating to non-technical stakeholders | Practice > resources here. Explain your flagship project to 3 non-technical people and track which explanations land | Plain-language framing, leading with outcome/value not architecture | Jargon-heavy explanations (the instinct to prove technical depth first is the wrong instinct in this role) | Mock customer call (Week 12) |

**FDE reality check:** the job is 30% technical execution and 70% correctly understanding what the customer actually needs (which is often not what they initially say they need) and communicating tradeoffs honestly. Your flagship project and PoC outreach in Months 4–6 are where this gets real — reading about it only gets you 20% of the way there.

---

## 11. Founding Engineer Curriculum

| Topic | How you build it | Practical task |
|---|---|---|
| 0→1 product development / MVP scoping | Your flagship project, scoped deliberately narrow (Section 12) — the discipline of cutting scope *is* the skill | Write down 3 features you're deliberately NOT building for v1, and why (Week 13) |
| System design (AI-specific) | Study how real AI products are architected — inference service separate from app service, async job queues for slow inference, caching strategy for repeated inputs | Draw your flagship architecture diagram before building (Week 13) |
| Build vs. buy | Concretely decide, and justify: fine-tune vs. use an API (e.g., a cloud vision API) for each part of your flagship pipeline | 1-paragraph justification per major component in your case study |
| Cost awareness / inference cost optimization | Your Week 11 TensorRT work + Week 9 feasibility-framework work directly feed this | Cost table in your case study: $/1000 inferences at each optimization stage |
| Observability & security basics | Logging/monitoring from Week 16 + basic auth/input validation on your API | Auth + rate limiting on your flagship API endpoints |
| Rapid iteration / technical ownership | Demonstrated by your weekly build-in-public cadence itself — you're already practicing this by Week 4 | The roadmap's cadence *is* the practice |

---

## 12. Flagship Project Specification

**Choose the specific domain by end of Week 6** (don't let this drift — a decided-but-imperfect project beats an endlessly-researched perfect one). Below is a concrete worked example; swap the domain for something you have genuine access/interest in (this matters for demo quality and for having real conversations about it).

**Worked example: Retail/warehouse shelf & queue monitoring PoC**

- **Problem:** Small retail/warehouse operators have no affordable way to know when shelves are empty or when checkout queues are too long — enterprise solutions are expensive and require IT integration they don't have.
- **Target customer:** Independent/small-chain retail stores, or a warehouse ops manager — someone who currently does this by walking the floor.
- **Why it matters:** Lost sales from out-of-stock shelves and customer attrition from long queues are measurable, dollar-quantifiable problems — an easy story to tell a non-technical buyer.
- **AI/CV approach:** Object detection (shelf gaps / person counting) + tracking (queue length over time) on existing camera feeds.
- **Architecture:** Camera/video input → FastAPI ingestion service → TensorRT-optimized YOLO model → Postgres (event log: timestamps, counts, alerts) → Next.js dashboard (live view + historical charts) → WebSocket for live updates → Docker Compose for local, AWS GPU instance for deployed inference.
- **Dataset:** Self-labeled subset (Week 6–7) + a public retail/pedestrian detection dataset for the base classes, fine-tuned toward your specific camera angle/domain.
- **Model:** YOLO (nano or small variant for real-time performance), fine-tuned.
- **Training/fine-tuning:** Documented in Weeks 6–7 with before/after metrics.
- **GPU inference:** TensorRT INT8/FP16 engine, benchmarked (Month 3 work reused here).
- **Backend:** FastAPI, async, with a job/event log in Postgres.
- **Database:** Postgres — events, alerts, historical aggregates.
- **Frontend/dashboard:** Next.js — live camera view with overlay boxes, historical queue-length/shelf-gap charts, alert list.
- **Docker:** Full Compose setup — inference service, API, DB, frontend as separate containers.
- **Deployment:** AWS (GPU instance for inference, standard instance or same box for the rest depending on cost), or a GPU cloud provider (Lambda/RunPod/Vast.ai) if AWS GPU pricing is prohibitive for your budget — **decide based on real cost comparison, and document that decision in your case study.**
- **Monitoring:** Basic latency/error/uptime tracking + inference FPS over time.
- **Performance benchmarks:** Your full Month 3 ladder (FP32→TensorRT INT8), applied to this specific model, in the case study.
- **Cost considerations:** $/hour for the GPU instance, estimated $/1000 inferences, and a realistic monthly cost estimate for "1 store with 2 cameras" — this single number is what makes a founder take you seriously.
- **Demo:** 2–3 min video, screen recording + voiceover, showing live detection + dashboard.
- **GitHub documentation:** See Section 14.
- **Case study:** See Section 14 structure below.

If retail/warehouse doesn't fit your interests or access, equally strong alternative domains: construction site safety monitoring (PPE detection), sports/fitness form analysis, agricultural crop monitoring, or manufacturing defect detection. The *pattern* (detection/tracking + dashboard + real cost story) matters more than the specific domain — pick one where you can plausibly get real footage/data and talk to 1–2 real people who'd actually use it.

---

## 13. 2–3 Supporting Projects

Each should take 1–2 weeks max and demonstrate a specific skill the flagship doesn't fully showcase:

1. **The optimization showcase:** A standalone repo that is *just* the FP32→AMP→ONNX→TensorRT INT8 benchmark ladder (your Month 3 work), cleaned up, generalized to run on any classification/detection model, with a clear README and chart. This is a "utility" repo that shows pure GPU-engineering depth, decoupled from the flagship's product framing.
2. **The rapid-PoC project:** A second, smaller CV application built fast (1 week) in a *different* sub-domain than your flagship (e.g., if flagship is detection-based, make this a segmentation or classification-based tool) — demonstrates you can scope and ship quickly, not just execute one big project slowly.
3. **(Optional) The integration project:** Something that showcases your full-stack strength combined with AI — e.g., a real-time WebSocket dashboard that could plug into *any* CV model (model-agnostic viewer), showing you think about reusable infrastructure, not just one-off scripts.

---

## 14. GitHub Strategy

- **One pinned "hub" repo** (or a well-organized profile README) that links to: flagship project, optimization showcase, and other supporting projects, plus a short "what I'm building toward" statement at the top.
- **Every project repo needs:** a README with (1) problem it solves, (2) architecture diagram or simple description, (3) how to run it, (4) results/benchmarks with actual numbers, (5) what you'd improve with more time. This last point signals seniority — junior portfolios rarely include it.
- **Commit hygiene:** commit often (even messy WIP commits are fine — real engineers don't have perfectly squashed history on personal projects), but keep `main` runnable at each milestone.
- **Flagship repo specifically** needs a `CASE_STUDY.md` at the root covering: Problem → Customer → Approach → Architecture (diagram) → Dataset/Model → Training results → GPU optimization results (the full ladder) → Deployment → Cost analysis → Demo (linked video) → What's next. This single file is what a hiring manager or founder will actually read.

---

## 15. LinkedIn Build-in-Public Strategy

**Cadence:** 2–3 posts/week minimum, following your progress honestly — including struggles, not just wins.

**Post types by phase, with concrete examples (not generic advice):**

- **Learning phase:** "Today I learned [specific concept] and here's the thing that finally made it click: [specific analogy/insight]." (e.g., "IoU finally clicked when I stopped thinking about it as a formula and started thinking about it as 'how much do these two boxes agree.'")
- **Building phase:** Screen recording/GIF + 2-3 sentences on what it does and one specific decision you made and why.
- **Debugging phase:** "Spent 3 hours on a bug that turned out to be [specific root cause]. Here's what I'd check first next time." Debugging posts often outperform "success" posts — people relate to them and they show real problem-solving.
- **GPU optimization phase:** Numbers-first posts (your Month 3 posts are naturally this format) — a before/after table or chart *is* the post, caption is short.
- **Product development phase:** "Here's the architecture decision I made this week and the alternative I considered" — shows founding-engineer-level thinking, not just "I built a feature."
- **Demo phase:** The 2-3 min demo video, posted natively (not just a YouTube link — native video performs better), with a short "here's the problem this solves" framing before the "here's how it works" part.
- **Deployment phase:** "It's live." Short, confident, link to demo or writeup, not the repo (repo link goes in comments/case study).
- **Results phase:** Cost/performance numbers framed for a founder audience, not an engineer audience — "$X/month to run this for one store" lands better with your target readers than "84.3 mAP."
- **Startup use case phase:** Reframe the whole project as a mini case study post — this is your highest-value post of the whole 6 months, treat it like a launch.

**Headline/About section:** Once your flagship project exists (Month 4+), your headline should say what you *do*, not what you *are studying* — e.g., "Full-stack engineer building production AI/CV products — GPU inference optimization, model serving, deployed systems" rather than "Aspiring AI Engineer | Learning Computer Vision." Your About section should open with the elevator pitch from Week 5 and link directly to the flagship demo.

**Note on your current profile:** I wasn't able to pull the actual content of your LinkedIn profile (LinkedIn blocks automated/logged-out access, and search only returned other people's profiles under similar names). If you paste your current headline, About section, and experience bullets here, I'll rewrite them directly against this positioning rather than giving you generic advice.

---

## 16. Networking Strategy

**Weekly target:** 5 new connection requests/week to the right people, 3–5 thoughtful comments/week on others' posts, 1 follow-up on any existing warm thread.

**Who to connect with, and why (in priority order):**
1. Founding Engineers/AI Engineers at seed-Series A AI startups — they'll understand your path best and are closest to your target role.
2. FDEs at AI infra/applied-AI companies — same reason, plus they can speak directly to what FDE interviews look for.
3. Founders of small AI/CV-adjacent startups — your eventual PoC targets.
4. AI Engineering Managers at slightly larger companies — useful for referrals even if not your first target.
5. Recruiters specializing in AI/ML roles — lower priority early, higher priority in Month 6.

**Connection request script (adapt, don't copy verbatim):**
> "Hi [Name] — I'm building toward Founding/Forward Deployed AI Engineer roles, currently deep in a CV project doing [one specific concrete thing, e.g., 'fine-tuning YOLO and optimizing inference with TensorRT']. Saw your work at [Company] and would love to connect."

Specific, references something real you're doing, references something real about them. No "I'd love to pick your brain" with nothing else attached.

**How to avoid sounding desperate:**
- Never ask for a job in the first message. Ever.
- Lead with a specific observation or question about their work, not your need for a role.
- Space out follow-ups (1 week minimum) and always add new information/context, never just "just following up!" with nothing new.
- Give before you ask — comment genuinely, share their posts when actually relevant, offer your PoC-log observations if relevant to their domain.

**Turning a connection into a technical conversation:**
> After 2-3 genuine exchanges (comments/DMs): "Would you be open to a quick 15-min call sometime? I'd love to hear how you think about [specific thing relevant to their role] — not looking for a job pitch, just want to learn from someone doing this for real."

**Offering a small PoC to a startup (Month 5–6, once flagship exists):**
> "I've been building [flagship project] — [one-line result, e.g., 'real-time detection running at 45 FPS with 30% cost reduction from GPU optimization']. If [specific problem you noticed in their product/domain] is something you're thinking about, I'd be glad to build a quick working prototype — no cost, just want the real-world feedback. Here's a 2-min demo of the base project: [link]."

Concrete, low-commitment ask, backed by an actual artifact — not "let me know if you have any opportunities."

---

## 17. Startup PoC Strategy

1. **Identify 15–20 target startups** (Month 5) where your flagship domain is plausibly relevant — early-stage, likely under-resourced on AI/CV specifically, findable via LinkedIn/AngelList/YC's current batch listings (search for the current batch, this changes twice a year).
2. **Send the PoC offer** (Section 16 script) to 5–10 of the best-fit ones.
3. **For anyone who responds:** run a real discovery call using your Week-7 questions and Section 10 framework — understand their actual problem before proposing anything.
4. **Scope a narrow PoC** (1 week of work, not a month) that proves one specific thing, not a full product.
5. **Deliver, demo, get feedback** — even a "this isn't quite what we need but here's what would help" response is valuable; document it.
6. **If it lands well:** propose a paid trial, contract role, or ask directly whether they're hiring/would consider a founding engineer conversation.
7. **Either way:** this becomes a second case study and a genuine "I've done this with a real company" credential — worth more than a 5th solo project.

---

## 18. Remote Job Strategy

**Path:** Learning (Months 1–3) → Portfolio (Months 1–5, flagship finished Month 5) → LinkedIn (ongoing from Week 1) → Networking (ongoing from Week 1) → Startup PoCs (Months 5–6) → Interviews (Month 6) → Remote job.

**Job search keywords:** "Founding Engineer," "Founding AI Engineer," "Forward Deployed Engineer," "Applied AI Engineer," "AI Solutions Engineer," "Computer Vision Engineer" (when paired with product/deployment language, not pure research), "ML Engineer" only when the JD emphasizes shipping/deployment over research.

**Job titles to prioritize (as listed in your brief):** Founding Engineer, Founding AI Engineer, Founding ML Engineer, Forward Deployed Engineer, Forward Deployed AI Engineer, Applied AI Engineer, AI Solutions Engineer.

**Where to find target companies:** current YC batch company lists, AI-focused job boards (search for what's currently active — this landscape shifts fast), LinkedIn's own job search filtered to "startup" company size + your keywords, and — most effective — the network you've built over the prior 5 months, since referrals massively outperform cold applications for these specific roles (they're rarely posted widely; many are filled through network first).

**Application strategy:** Don't mass-apply blindly. For your top 15-20 targets, apply *and* find a warm path in via your network simultaneously. For the rest, standard applications are fine as volume. Always lead your application/resume with the flagship project link, not a generic summary.

---

## 19. Interview Preparation

- **System design (AI-specific):** Practice designing an end-to-end CV inference pipeline under constraints (latency budget, cost budget, accuracy requirement) — your flagship project *is* your practice material; be ready to redesign it live under different constraints ("what if you needed sub-50ms latency," "what if you had 1/10th the budget").
- **AI/CV technical interview prep:** Be ready to explain, precisely, every technical decision in your flagship project — why YOLO over an alternative, why this augmentation strategy, why this quantization level, what the accuracy/speed tradeoff actually was. Depth on your own work beats breadth of memorized algorithms for these roles.
- **FDE/customer-facing interview prep:** Practice a mock "customer scenario" role-play (many FDE interviews literally do this) — a vague business problem is presented, you have to ask discovery questions, scope a rough technical approach, and communicate tradeoffs, live, in the interview. Your Week 12 mock call and any real PoC conversations are direct practice for this.
- **Behavioral interview prep:** Prepare STAR-format stories from your project work specifically around: a technical decision that didn't pan out and what you did, a time you had to say no to scope, a time you had to explain something technical to a non-technical person. Real stories from this roadmap, not hypotheticals.

---

## 20. Exact Definition of "Job Ready"

You are job-ready when **all** of the following are true, not just "6 months have passed":

- [ ] You can explain, without notes, the full FP32→TensorRT-INT8 optimization ladder and why each step matters.
- [ ] Your flagship project is deployed, demoable in under 3 minutes, and documented with a real cost/performance story.
- [ ] You've had at least 1 real conversation with someone outside your own head about your flagship project's actual usefulness (ideally 1 real PoC attempt with a startup, even if it didn't convert).
- [ ] Your LinkedIn has a consistent 5-month build-in-public history, not a sudden portfolio dump in week 25.
- [ ] You have at least 1 warm referral path into 3+ target companies from your network.
- [ ] You can do a live "customer scenario" role-play and land on a reasonable scoped approach within 15-20 minutes.
- [ ] Your resume leads with shipped, deployed, benchmarked work — not course completions or certificates.

---

## 21. Final Checklist (0% → 100%)

**Foundations (Month 1)**
- [ ] GPU + CUDA + PyTorch environment verified working
- [ ] OpenCV real-time pipeline built
- [ ] Custom image classifier trained and evaluated on own GPU
- [ ] 4+ LinkedIn posts published, GitHub repo live

**Detection & Tracking (Month 2)**
- [ ] Flagship domain decided
- [ ] Custom dataset labeled (200-500+ images)
- [ ] YOLO fine-tuned with documented before/after metrics
- [ ] Object tracking working on real video

**GPU Optimization & Serving (Month 3)**
- [ ] AMP/mixed-precision benchmarked
- [ ] ONNX export + benchmark complete
- [ ] TensorRT FP16 and INT8 engines built and benchmarked
- [ ] Full FP32→TensorRT ladder documented and posted
- [ ] Profiling done, bottleneck identified
- [ ] FastAPI serving endpoint working

**Flagship Build (Month 4)**
- [ ] Backend (FastAPI + Postgres) built
- [ ] Model integrated into production code paths
- [ ] Frontend/dashboard built and connected
- [ ] Full stack Dockerized
- [ ] Deployed to AWS/cloud GPU provider
- [ ] Basic monitoring wired in

**Polish & Outreach (Month 5)**
- [ ] Product hardened (edge cases, error handling)
- [ ] Demo video recorded
- [ ] Full case study written
- [ ] 2-3 supporting projects finished
- [ ] PoC offers sent to 5-10 startups
- [ ] At least 1 real discovery call completed

**Job Search (Month 6)**
- [ ] Resume + LinkedIn fully repositioned around portfolio
- [ ] Target company list (30-40) built
- [ ] Applications submitted (volume + targeted warm paths)
- [ ] System design + technical + FDE interview prep done
- [ ] Mock "customer scenario" interviews practiced
- [ ] Active interview pipeline and/or offer in hand

**Ongoing throughout (don't let these lapse):**
- [ ] 2-3 LinkedIn posts/week, every week
- [ ] 5 new network connections/week, every week
- [ ] Every project committed to GitHub with a real README
- [ ] Problem log updated weekly (feeds future PoC ideas even after month 6)

---

*This roadmap is a system, not a script. If a week gets compressed by real life, protect the GPU-optimization work and the flagship build — those are the two things nothing else in this plan can substitute for.*
