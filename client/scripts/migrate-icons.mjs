import fs from "fs";
import path from "path";

const root = path.resolve("app");
const skip = new Set([
  "components/AuthPage.tsx",
  "components/LoginForm.tsx",
  "components/SignupForm.tsx",
  "components/OTPLogin.tsx",
  "components/VerifyOTP.tsx",
  "components/ForgotPasswordForm.tsx",
  "components/AuthCard.tsx",
  "components/PhoneInput.tsx",
  "components/PremiumLoginPage.tsx",
]);

const fiMap = {
  FiGrid: "LayoutGrid",
  FiList: "List",
  FiUser: "User",
  FiLogOut: "LogOut",
  FiX: "X",
  FiClock: "Clock",
  FiMenu: "Menu",
  FiBell: "Bell",
  FiSearch: "Search",
  FiHome: "Home",
  FiUsers: "Users",
  FiBriefcase: "Briefcase",
  FiShield: "Shield",
  FiSettings: "Settings",
  FiBox: "Package",
  FiPieChart: "PieChart",
  FiShoppingBag: "ShoppingBag",
  FiCalendar: "Calendar",
  FiStar: "Star",
  FiArrowLeft: "ArrowLeft",
  FiArrowRight: "ArrowRight",
  FiCheck: "Check",
  FiShoppingCart: "ShoppingCart",
  FiEdit2: "Pencil",
  FiTrash2: "Trash2",
  FiSlash: "Ban",
  FiCheckCircle: "CheckCircle",
  FiExternalLink: "ExternalLink",
  FiPower: "Power",
  FiDollarSign: "DollarSign",
  FiActivity: "Activity",
  FiTrendingUp: "TrendingUp",
  FiXCircle: "XCircle",
  FiPhone: "Phone",
  FiKey: "Key",
  FiInfo: "Info",
  FiMessageSquare: "MessageSquare",
  FiMail: "Mail",
  FiLock: "Lock",
  FiEye: "Eye",
  FiEyeOff: "EyeOff",
  FiChevronLeft: "ChevronLeft",
  FiChevronRight: "ChevronRight",
  FiRefreshCw: "RefreshCw",
  FiSmartphone: "Smartphone",
  FiAlertCircle: "AlertCircle",
  FiPhoneCall: "PhoneCall",
};

const faMap = {
  FaBell: "Bell",
  FaChartBar: "BarChart3",
  FaBox: "Package",
  FaClipboardList: "ClipboardList",
  FaTruck: "Truck",
  FaWarehouse: "Warehouse",
  FaCog: "Settings",
};

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) files.push(p);
  }
  return files;
}

const changed = [];
for (const file of walk(root)) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (skip.has(rel)) continue;
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("react-icons")) continue;

  const used = new Set();
  for (const [oldName, newName] of Object.entries({ ...fiMap, ...faMap })) {
    if (src.includes(oldName)) used.add(newName);
  }

  src = src.replace(/import\s*\{[^}]+\}\s*from\s*['"]react-icons\/[^'"]+['"];?\n?/g, "");
  src = src.replace(/import\s*\{[^}]+\}\s*from\s*['"]react-icons\/fc['"];?\n?/g, "");
  src = src.replace(/import\s*\{[^}]+\}\s*from\s*['"]react-icons\/md['"];?\n?/g, "");

  for (const [oldName, newName] of Object.entries({ ...fiMap, ...faMap })) {
    src = src.replace(new RegExp(`<${oldName}\\b`, "g"), `<${newName}`);
    src = src.replace(new RegExp(`\\b${oldName}\\b`, "g"), newName);
  }

  src = src.replace(/<(\w+)\s+size=\{(\d+)\}/g, '<$1 className="h-4 w-4" strokeWidth={1.5}');
  src = src.replace(/<(\w+)\s+size=\{22\}/g, '<$1 className="h-5 w-5" strokeWidth={1.5}');
  src = src.replace(/<(\w+)\s+size=\{24\}/g, '<$1 className="h-6 w-6" strokeWidth={1.5}');
  src = src.replace(/<(\w+)\s+className="([^"]*)"\s+size=\{(\d+)\}/g, '<$1 className="$2 h-4 w-4" strokeWidth={1.5}');

  if (used.size) {
    const icons = [...used].sort().join(", ");
    const importLine = `import { ${icons} } from "lucide-react";\n`;
    if (!src.includes('from "lucide-react"') && !src.includes("from 'lucide-react'")) {
      src = importLine + src;
    }
  }

  fs.writeFileSync(file, src);
  changed.push(rel);
}

console.log("Changed:", changed.length);
changed.forEach((f) => console.log(f));
