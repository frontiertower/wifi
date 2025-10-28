import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminVouchersTable() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [voucherType, setVoucherType] = useState("guest");
  const [quantity, setQuantity] = useState("1");
  const { toast } = useToast();

  //todo: remove mock functionality
  const vouchers = [
    { code: "FT-GUEST-ABC123", type: "Guest", uses: "3/5", expiry: "2025-11-30", status: "Active" },
    { code: "FT-EVENT-XYZ789", type: "Event", uses: "12/20", expiry: "2025-11-15", status: "Active" },
    { code: "FT-MEMBER-DEF456", type: "Member", uses: "1/1", expiry: "2026-01-01", status: "Used" },
    { code: "FT-GUEST-GHI789", type: "Guest", uses: "0/10", expiry: "2025-10-25", status: "Expired" }
  ];

  const handleGenerateVoucher = () => {
    console.log('Generating voucher:', { type: voucherType, quantity });
    toast({
      title: "Voucher Generated",
      description: `Created ${quantity} ${voucherType} voucher(s)`,
    });
    setShowGenerator(false);
  };

  const copyVoucherCode = (code: string) => {
    console.log('Copying voucher code:', code);
    toast({
      title: "Copied!",
      description: "Voucher code copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Voucher Management</h2>
          <Button
            onClick={() => setShowGenerator(!showGenerator)}
            data-testid="button-generate-voucher"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Voucher
          </Button>
        </div>

        {showGenerator && (
          <Card className="p-4 mb-6 bg-muted/50">
            <h3 className="font-medium mb-4">Generate New Voucher</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Voucher Type</Label>
                <Select value={voucherType} onValueChange={setVoucherType}>
                  <SelectTrigger data-testid="select-voucher-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Guest Access</SelectItem>
                    <SelectItem value="event">Event Access</SelectItem>
                    <SelectItem value="member">Member Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  data-testid="input-voucher-quantity"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerateVoucher} className="w-full" data-testid="button-create-voucher">
                  Create
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm">Code</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Uses</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Expiry</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher, index) => (
                <tr key={index} className="border-b hover-elevate" data-testid={`row-voucher-${index}`}>
                  <td className="py-3 px-4 font-mono text-sm">{voucher.code}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{voucher.type}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">{voucher.uses}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{voucher.expiry}</td>
                  <td className="py-3 px-4">
                    <Badge variant={voucher.status === "Active" ? "default" : "outline"}>
                      {voucher.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyVoucherCode(voucher.code)}
                      data-testid={`button-copy-${index}`}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
