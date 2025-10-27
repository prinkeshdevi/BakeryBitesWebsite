import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertCustomOrderSchema, type InsertCustomOrder } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CustomOrderForm() {
  const { toast } = useToast();

  const form = useForm<InsertCustomOrder>({
    resolver: zodResolver(insertCustomOrderSchema),
    defaultValues: {
      cakeType: "",
      size: "",
      flavor: "",
      customMessage: "",
      deliveryDate: "",
      customerName: "",
      phone: "",
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertCustomOrder) =>
      apiRequest("POST", "/api/orders/custom", data),
    onSuccess: () => {
      toast({
        title: "Order Submitted!",
        description: "We'll contact you soon to confirm your custom cake order.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/orders/custom"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCustomOrder) => {
    mutation.mutate(data);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background" id="custom-order">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4"
          data-testid="heading-custom-order"
        >
          <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Customize Your Cake
          </span>
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-12">
          Create your dream cake with our expert bakers
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cakeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cake Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-cake-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday Cake</SelectItem>
                        <SelectItem value="wedding">Wedding Cake</SelectItem>
                        <SelectItem value="anniversary">Anniversary Cake</SelectItem>
                        <SelectItem value="celebration">Celebration Cake</SelectItem>
                        <SelectItem value="custom">Custom Design</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-size">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0.5kg">0.5 Kg</SelectItem>
                        <SelectItem value="1kg">1 Kg</SelectItem>
                        <SelectItem value="1.5kg">1.5 Kg</SelectItem>
                        <SelectItem value="2kg">2 Kg</SelectItem>
                        <SelectItem value="3kg">3 Kg</SelectItem>
                        <SelectItem value="custom">Custom Size</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="flavor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flavor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-flavor">
                        <SelectValue placeholder="Select flavor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="chocolate">Chocolate</SelectItem>
                      <SelectItem value="vanilla">Vanilla</SelectItem>
                      <SelectItem value="strawberry">Strawberry</SelectItem>
                      <SelectItem value="red-velvet">Red Velvet</SelectItem>
                      <SelectItem value="butterscotch">Butterscotch</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                      <SelectItem value="black-forest">Black Forest</SelectItem>
                      <SelectItem value="custom">Custom Flavor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Message to be written on the cake"
                      className="resize-none"
                      rows={3}
                      data-testid="input-custom-message"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      data-testid="input-delivery-date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          data-testid="input-customer-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+91 XXXXXXXXXX"
                            data-testid="input-phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full py-6 text-lg"
              disabled={mutation.isPending}
              data-testid="button-submit-order"
            >
              {mutation.isPending ? "Submitting..." : "Submit Order"}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
