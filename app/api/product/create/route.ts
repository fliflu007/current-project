import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/require-user";
import { getCompanyId } from "@/services/products.service";

export async function POST(request: Request) {
  console.log("endpoint hit");
  try {
    ///////******** AUTHORISAITON  *************/
    // const userId = await requireUserId();
    // if (!userId) {
    //   return Response.json(
    //     {
    //       data: null,
    //       error: {
    //         code: "UNAUTHORIZED",
    //         message: "You must be logged in",
    //       },
    //     },
    //     { status: 401 },
    //   );
    // }

    const userId = process.env.TEST_USER_ID;
    if (!userId) {
      throw new Error("TEST_USER_ID is not configured");
    }

    const companyId = getCompanyId(userId);

    // add image to cloud

    // add images to db

    // return success ornot

    return NextResponse.json("test");
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        },
      },
      { status: 500 },
    );
  }
}
