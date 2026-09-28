import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      phone,
      email,
      companyName,
      region = "전국",
      categories = [],
      notifyMorning = true,
      notifyDeadline = true,
      targetBid = "전체 맞춤 공고",
      subscribedAt = new Date().toISOString(),
    } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "전화번호는 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    const newSubscriber = {
      id: "SUB-" + Date.now(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      companyName: companyName ? companyName.trim() : "",
      region,
      categories,
      notifyMorning,
      notifyDeadline,
      subscribedAt,
      targetBid,
      status: "active",
    };

    // 1. 텔레그램 봇으로 회장님 스마트폰에 실시간 전송
    const telegramResult = await sendTelegramNotification(newSubscriber);

    // 2. 서버 파일(public/data/subscribers.json)에 기록 시도 (로컬/서버 지속성)
    try {
      const filePath = path.join(process.cwd(), "public", "data", "subscribers.json");
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const subscribers = JSON.parse(fileContent || "[]");
        // 중복 방지 (동일 번호는 최신으로 갱신)
        const filtered = subscribers.filter((s: any) => s.phone !== newSubscriber.phone);
        filtered.unshift(newSubscriber);
        fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), "utf-8");
      }
    } catch (fsErr) {
      console.warn("[Subscribe API] subscribers.json 기록 실패(무시가능):", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: "알림 신청이 정상적으로 완료되었습니다.",
      telegramSent: telegramResult.success,
      subscriber: newSubscriber,
    });
  } catch (error: any) {
    console.error("[Subscribe API Error]:", error);
    return NextResponse.json(
      { error: "신청 처리 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
