import { Lesson } from "../types";

export const FDE_LESSONS: Lesson[] = [
  {
    id: 6001,
    title: "Week 1: Environment + Python Refresh",
    module: "Month 1: Python + CV Foundations",
    description:
      "Python idioms a JS dev rarely uses daily (comprehensions, generators, context managers), NumPy basics, and getting PyTorch + CUDA running on the RTX 5060 Ti. Verify with torch.cuda.is_available().",
    type: "Build",
    lang: "Python",
  },
  {
    id: 6002,
    title: "Week 2: OpenCV Basics",
    module: "Month 1: Python + CV Foundations",
    description:
      "Image I/O, color spaces, resizing, filtering, thresholding, contours. Build a real-time webcam pipeline (grayscale → edge detection → contour count overlay) and log its CPU FPS baseline.",
    type: "Build",
    lang: "OpenCV",
  },
  {
    id: 6003,
    title: "Week 3: CNN Fundamentals + First Classifier (Part 1)",
    module: "Month 1: Python + CV Foundations",
    description:
      "Convolution/pooling at the engineering level — intuition not proofs. Run pretrained ResNet/EfficientNet on your own photos and collect a small custom classification dataset (5-10 classes).",
    type: "Learn",
    lang: "PyTorch",
  },
  {
    id: 6004,
    title: "Week 4: Training Loop Mastery + First Fine-tune",
    module: "Month 1: Python + CV Foundations",
    description:
      "PyTorch training loop anatomy, data augmentation via torchvision.transforms, and fine-tuning your pretrained model. Log loss/accuracy per epoch and compare results with and without augmentation.",
    type: "Build",
    lang: "PyTorch",
  },
  {
    id: 6005,
    title: "Week 5: Object Detection + Pretrained YOLO",
    module: "Month 2: Detection + First Fine-tune",
    description:
      "Bounding boxes, IoU, NMS, mAP at a practical level. Run Ultralytics YOLOv8/v11 inference on images and video and benchmark FPS across model sizes (nano vs small vs medium).",
    type: "Build",
    lang: "YOLO",
  },
  {
    id: 6006,
    title: "Week 6: Dataset Labeling + Custom Fine-tune (Part 1)",
    module: "Month 2: Detection + First Fine-tune",
    description:
      "YOLO dataset format, Roboflow/CVAT labeling workflow, and choosing your flagship project domain. Collect and label 200-500 images for it and document class distribution.",
    type: "Build",
    lang: "Roboflow",
  },
  {
    id: 6007,
    title: "Week 7: Custom Fine-tune (Part 2) + Evaluation",
    module: "Month 2: Detection + First Fine-tune",
    description:
      "Fine-tune YOLO on your labeled dataset, read precision/recall/mAP per class and the confusion matrix, and document the before/after vs. the pretrained baseline.",
    type: "Build",
    lang: "YOLO",
  },
  {
    id: 6008,
    title: "Week 8: Tracking + Video Processing",
    module: "Month 2: Detection + First Fine-tune",
    description:
      "Tracking-by-detection, ID persistence across frames, and integrating ByteTrack on top of your detector. Measure end-to-end FPS with detection + tracking combined.",
    type: "Build",
    lang: "ByteTrack",
  },
  {
    id: 6009,
    title: "Week 9: CUDA Fundamentals + Mixed Precision",
    module: "Month 3: GPU Optimization + Serving",
    description:
      "CUDA cores vs Tensor Cores, memory hierarchy, why FP16/INT8 matter, and PyTorch Automatic Mixed Precision. Benchmark training time + VRAM for FP32 vs AMP (FP16).",
    type: "Learn",
    lang: "CUDA",
  },
  {
    id: 6010,
    title: "Week 10: ONNX Export",
    module: "Month 3: GPU Optimization + Serving",
    description:
      "Export your fine-tuned detector to ONNX and run inference via ONNX Runtime. Compare latency against native PyTorch and learn common export pitfalls (dynamic shapes, unsupported ops).",
    type: "Build",
    lang: "ONNX",
  },
  {
    id: 6011,
    title: "Week 11: TensorRT + INT8",
    module: "Month 3: GPU Optimization + Serving",
    description:
      "Build TensorRT engines (FP16 then INT8 with calibration data) and run the full ladder: PyTorch FP32 → ONNX Runtime → TensorRT FP16 → INT8 with latency, FPS, and accuracy deltas.",
    type: "Build",
    lang: "TensorRT",
  },
  {
    id: 6012,
    title: "Week 12: GPU Profiling + FastAPI Serving",
    module: "Month 3: GPU Optimization + Serving",
    description:
      "Find the real inference bottleneck with torch.profiler/Nsight (usually CPU preprocessing, not the model), then wrap your best TensorRT engine in a FastAPI endpoint with real latency numbers.",
    type: "Build",
    lang: "FastAPI",
  },
  {
    id: 6013,
    title: "Week 13: Flagship Backend Architecture",
    module: "Month 4: Flagship Build Sprint",
    description:
      "Postgres schema, FastAPI endpoints beyond inference (auth, CRUD, job queue), and a Docker Compose skeleton. Draw the architecture diagram and write down 3 features you're NOT building for v1.",
    type: "Ship",
    lang: "FastAPI",
  },
  {
    id: 6014,
    title: "Week 14: Model Integration Into the Backend",
    module: "Month 4: Flagship Build Sprint",
    description:
      "Production code paths for the model — error handling, input validation, logging. Move from notebook to production-grade integration, not script code.",
    type: "Ship",
    lang: "Python",
  },
  {
    id: 6015,
    title: "Week 15: Flagship Dashboard",
    module: "Month 4: Flagship Build Sprint",
    description:
      "Next.js frontend — upload/stream input, show results, basic auth, WebSocket for live video if the product calls for it.",
    type: "Ship",
    lang: "Next.js",
  },
  {
    id: 6016,
    title: "Week 16: Deploy + Monitoring",
    module: "Month 4: Flagship Build Sprint",
    description:
      "Deploy the full stack to AWS or a GPU cloud provider. Wire up monitoring (uptime, latency, error rate) and cost tracking from day one.",
    type: "Ship",
    lang: "AWS",
  },
  {
    id: 6017,
    title: "Week 17: Harden the Product",
    module: "Month 5: Polish + FDE Motion",
    description:
      "Edge cases, error states, a second use-case or dataset variant to show generality, and revisit cost numbers with real usage.",
    type: "Ship",
    lang: "Python",
  },
  {
    id: 6018,
    title: "Week 18: Demo Video + Case Study",
    module: "Month 5: Polish + FDE Motion",
    description:
      "Record a 2-3 minute demo video (screen recording + voiceover) and write the full case study: problem → approach → architecture → results → cost → what you'd do with more time.",
    type: "Ship",
    lang: "Portfolio",
  },
  {
    id: 6019,
    title: "Week 19: Supporting Projects",
    module: "Month 5: Polish + FDE Motion",
    description:
      "Finish the optimization showcase (FP32→TensorRT ladder repo), a rapid-PoC project in a different CV sub-domain, and optionally an integration/dashboard project. Polish all READMEs.",
    type: "Ship",
    lang: "GitHub",
  },
  {
    id: 6020,
    title: "Week 20: PoC Outreach Begins",
    module: "Month 5: Polish + FDE Motion",
    description:
      "Send your PoC offer doc to 5-10 specific startups/founders whose problems match your flagship domain, and run at least 1 real discovery call.",
    type: "Ship",
    lang: "FDE",
  },
  {
    id: 6021,
    title: "Week 21: Resume + Target Company List",
    module: "Month 6: Job Search Push",
    description:
      "Finalize resume + LinkedIn headline/About around your completed portfolio, build a target list of 30-40 companies, and start applications at 10-15/week.",
    type: "Job Hunt",
    lang: "LinkedIn",
  },
  {
    id: 6022,
    title: "Week 22: Applications + Interview Prep",
    module: "Month 6: Job Search Push",
    description:
      "Keep applying, begin system design + CV technical interview prep, and keep any active PoC conversation moving.",
    type: "Job Hunt",
    lang: "Interviews",
  },
  {
    id: 6023,
    title: "Week 23: Mock Interviews",
    module: "Month 6: Job Search Push",
    description:
      "Mock interviews — technical, behavioral, and FDE-style customer-scenario role-plays. Practice explaining your flagship in 60 seconds.",
    type: "Job Hunt",
    lang: "Interviews",
  },
  {
    id: 6024,
    title: "Week 24: First Interview Loops",
    module: "Month 6: Job Search Push",
    description:
      "Real interview loops likely start. Keep networking (referrals beat cold applications) and propose a paid trial or contract-to-hire if a PoC went well.",
    type: "Job Hunt",
    lang: "Interviews",
  },
  {
    id: 6025,
    title: "Week 25: Offers + Negotiation",
    module: "Month 6: Job Search Push",
    description:
      "Negotiate if offers arrive and keep a steady trickle of applications going — don't stop just because one pipeline looks promising.",
    type: "Job Hunt",
    lang: "Interviews",
  },
  {
    id: 6026,
    title: "Week 26: Consolidate",
    module: "Month 6: Job Search Push",
    description:
      "Close an offer, land in final rounds, or extend the search — your portfolio, network, content, and PoC pipeline are now durable assets that keep generating opportunities.",
    type: "Job Hunt",
    lang: "Hire",
  },
];
