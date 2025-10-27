import { useEffect, useState } from "react";
import { Instagram, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function InstagramModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("instagram-modal-seen");
    
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("instagram-modal-seen", "true");
  };

  const handleFollow = () => {
    localStorage.setItem("instagram-modal-seen", "true");
    window.open("https://www.instagram.com/bakery_bites21/?hl=eng", "_blank");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-instagram">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center space-x-2 text-2xl">
            <Instagram className="w-8 h-8 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Follow Us on Instagram!
            </span>
          </DialogTitle>
          <DialogDescription className="text-center pt-4">
            Stay updated with our latest creations, special offers, and behind-the-scenes content.
            Join our sweet community @bakery_bites21
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-3 pt-4">
          <Button
            onClick={handleFollow}
            variant="default"
            className="w-full"
            data-testid="button-follow-instagram"
          >
            <Instagram className="w-5 h-5 mr-2" />
            Follow @bakery_bites21
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full"
            data-testid="button-close-modal"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
