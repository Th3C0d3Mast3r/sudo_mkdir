"use client";

import { BellIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useAuth, useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Notification {
  _id: string;
  user: string;
  type: string;
  sender: {
    username: string;
    photo: string;
  };
  question: {
    title: string;
    _id: string;
  };
  answer: {
    answer: string;
  };
  createdAt: Date;
  isRead: boolean;
}

export default function Notification() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const getNotifications = async () => {
    const token = await getToken();
    const response = await axios.get(`${BACKEND_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.notifications;
  };

  const applyFilter = () => {
    if (filter === "all") {
      setFilteredNotifications(notifications);
    } else if (filter === "mentions") {
      setFilteredNotifications(
        notifications.filter(
          (notification) =>
            notification.type === "mention in question" ||
            notification.type === "mention in answer"
        )
      );
    } else if (filter === "unread") {
      setFilteredNotifications(
        notifications.filter((notification) => !notification.isRead)
      );
    } else if (filter === "read") {
      setFilteredNotifications(
        notifications.filter((notification) => notification.isRead)
      );
    }
  };
  useEffect(() => {
    applyFilter();
  }, [notifications, filter]);

  useEffect(() => {
    setLoading(true);
    getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative" variant={"outline"} size={"default"}>
          <BellIcon className="w-10 h-10 z-10" />
          {!loading &&
            notifications.filter((noti) => !noti.isRead).length != 0 && (
              <Badge className="absolute -top-2 -right-1.5 bg-primary text-white rounded-full px-1.5 py-0.5 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center border border-white shadow">
                {notifications.filter((noti) => !noti.isRead).length}
              </Badge>
            )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[600px] mr-10 max-h-[500px]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <Select value={filter} onValueChange={(value) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="mentions">Mentions</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredNotifications.length == 0 && (
          <div className="text-center text-muted-foreground py-5">
            No notifications yet
          </div>
        )}
        {filteredNotifications.map((noti) => (
          <DropdownMenuItem
            key={noti._id}
            className={cn(!noti.isRead && "border border-primary")}
          >
            <NotiCard notification={noti} getToken={getToken} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const Content = ({ notification }: { notification: Notification }) => {
  if (notification.type === "mention in question") {
    return (
      <span>
        <span className="text-primary font-semibold">
          {notification.sender.username}
        </span>{" "}
        mentioned you in a question :{" "}
        <span className="text-primary font-semibold">
          {notification.question.title}
        </span>
      </span>
    );
  }
  if (notification.type === "mention in answer") {
    return (
      <span>
        <span className="text-primary font-semibold">
          {notification.sender.username}
        </span>{" "}
        mentioned you in an answer :{" "}
        <span className="text-primary font-semibold">
          {notification.question.title}
        </span>
      </span>
    );
  }
  if (notification.type === "answer") {
    return (
      <span>
        <span className="text-primary font-semibold">
          {notification.sender.username}
        </span>{" "}
        answered your question :{" "}
        <span className="text-primary font-semibold">
          {notification.question.title}
        </span>
      </span>
    );
  }
  return null;
};

const NotiCard = ({
  notification,
  getToken,
}: {
  notification: Notification;
  getToken: any;
}) => {
  const createdAt = new Date(notification.createdAt);
  const formattedDate = format(createdAt, "dd MMM yyyy, HH:mm");
  const router = useRouter();

  if (notification)
    return (
      <Card
        className="w-full p-0 shadow-none border-none bg-transparent"
        onClick={async () => {
          router.push(`/questions/${notification.question._id}`);
          const token = await getToken();
          try {
            notification.isRead = true;
            await axios.post(
              `${BACKEND_URL}/notifications/read`,
              {
                notificationId: notification._id,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          } catch (error) {
            console.error("Error marking notification as read:", error);
          }
        }}
      >
        <CardHeader className="flex flex-row items-start justify-between px-2 py-1 pb-0 gap-2">
          <CardTitle className="text-sm font-semibold leading-tight text-left line-clamp-2">
            <Content notification={notification} />
          </CardTitle>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 mt-0.5">
            {formattedDate}
          </span>
        </CardHeader>
        <CardContent className="px-2 pt-1 pb-2">
          {notification.answer?.answer && (
            <div
              className="p-3 prose max-w-2xl overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: notification.answer.answer }}
            />
          )}
        </CardContent>
      </Card>
    );
};
