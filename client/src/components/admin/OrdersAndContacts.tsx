import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CustomOrder, Contact } from "@shared/schema";
import { format } from "date-fns";

export default function OrdersAndContacts() {
  const { data: orders, isLoading: ordersLoading } = useQuery<CustomOrder[]>({
    queryKey: ["/api/orders/custom"],
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Inquiries</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" data-testid="tab-orders">
              Custom Orders ({orders?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">
              Contact Messages ({contacts?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4 mt-4">
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border rounded-lg hover-elevate"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{order.customerName}</h4>
                    <span className="text-xs text-muted-foreground">
                      {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      <span className="font-medium">{order.cakeType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>{" "}
                      <span className="font-medium">{order.size}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Flavor:</span>{" "}
                      <span className="font-medium">{order.flavor}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivery:</span>{" "}
                      <span className="font-medium">{order.deliveryDate}</span>
                    </div>
                  </div>
                  {order.customMessage && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      Message: "{order.customMessage}"
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm">
                    <a
                      href={`tel:${order.phone}`}
                      className="text-primary hover:underline"
                    >
                      {order.phone}
                    </a>
                    <a
                      href={`mailto:${order.email}`}
                      className="text-primary hover:underline"
                    >
                      {order.email}
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No custom orders yet
              </p>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4 mt-4">
            {contactsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : contacts && contacts.length > 0 ? (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 border rounded-lg hover-elevate"
                  data-testid={`contact-${contact.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{contact.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {contact.createdAt ? format(new Date(contact.createdAt), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {contact.email}
                  </a>
                  <p className="text-sm mt-2">{contact.message}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No contact messages yet
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
