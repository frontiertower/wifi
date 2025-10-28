import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";
import { useState } from "react";

export default function AdminUsersTable() {
  const [searchQuery, setSearchQuery] = useState("");

  //todo: remove mock functionality
  const users = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", type: "Member", status: "Active", registeredAt: "2025-10-15" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", type: "Guest", status: "Active", registeredAt: "2025-10-28" },
    { id: 3, name: "Carol Davis", email: "carol@example.com", type: "Event", status: "Expired", registeredAt: "2025-10-20" },
    { id: 4, name: "David Wilson", email: "david@example.com", type: "Member", status: "Active", registeredAt: "2025-09-30" },
    { id: 5, name: "Eva Martinez", email: "eva@example.com", type: "Guest", status: "Active", registeredAt: "2025-10-28" }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">Registered Users</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-users"
            />
          </div>
          <Button variant="outline" size="default" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Email</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Registered</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover-elevate" data-testid={`row-user-${user.id}`}>
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4 text-muted-foreground text-sm">{user.email}</td>
                <td className="py-3 px-4">
                  <Badge variant="secondary">{user.type}</Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={user.status === "Active" ? "default" : "outline"}>
                    {user.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{user.registeredAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </Card>
  );
}
