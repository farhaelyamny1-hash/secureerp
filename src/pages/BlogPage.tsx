import { motion } from "framer-motion";

const posts = [
  { title: "كيف تختار نظام ERP المناسب لشركتك؟", date: "أبريل 2026", excerpt: "دليل شامل لاختيار نظام إدارة الموارد المناسب لحجم ونوع عملك في منطقة الشرق الأوسط." },
  { title: "أهمية المحاسبة السحابية للشركات الصغيرة", date: "مارس 2026", excerpt: "اكتشف كيف يمكن للمحاسبة السحابية أن توفر عليك الوقت والجهد وتزيد من دقة بياناتك المالية." },
  { title: "٥ نصائح لإدارة المخزون بكفاءة", date: "فبراير 2026", excerpt: "تعلم أفضل الممارسات لإدارة المخزون وتجنب مشاكل نفاد البضائع أو تكدسها." },
];

const BlogPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-heading font-bold text-4xl text-foreground mb-4">المدونة</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            مقالات ونصائح حول إدارة الأعمال والمحاسبة السحابية وأنظمة ERP.
          </p>
        </motion.div>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
            >
              <p className="text-xs text-muted-foreground mb-2">{post.date}</p>
              <h2 className="font-heading font-semibold text-xl text-foreground mb-2">{post.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
