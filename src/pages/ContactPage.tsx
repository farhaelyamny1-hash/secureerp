import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading font-bold text-4xl text-foreground mb-4">تواصل معنا</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            نحن هنا لمساعدتك. أرسل لنا رسالة وسنرد عليك في أقرب وقت.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-6">
              {[
                { icon: Phone, label: "الهاتف", value: "01010891984" },
                { icon: Mail, label: "البريد الإلكتروني", value: "info@yotait.com" },
                { icon: MapPin, label: "الشركة", value: "Yota IT" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-8 space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="الاسم" className="font-body" />
              <Input placeholder="البريد الإلكتروني" type="email" className="font-body" />
            </div>
            <Input placeholder="الموضوع" className="font-body" />
            <Textarea placeholder="رسالتك..." rows={5} className="font-body" />
            <Button className="w-full gradient-primary text-primary-foreground font-heading">إرسال الرسالة</Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
