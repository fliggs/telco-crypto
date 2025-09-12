import {
  OrderType,
  PublicSubscriptionWithOfferDto,
  SimType,
  SubscriptionStatus,
} from "api-client-ts";
import React, { FC, Fragment, useCallback, useEffect, useMemo } from "react";
import { Alert, BackHandler, View } from "react-native";
import { router } from "expo-router";
import { format, isFuture } from "date-fns";
import { useRouter } from "expo-router";

import { Color, Spacing } from "@/constants";
import { formatCost, formatPhoneNum } from "@/util";
import { useMe } from "@/providers/MeProvider";
import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { useSupport } from "@/providers/SupportProvider";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";

import SvgGear from "@/assets/icons/gear.svg";
import SvgInfoBlack from "@/assets/icons/SvgInfoBlack.svg";

import Button, { ButtonType } from "./Button";
import MenuItemLink from "./MenuItemLink";
import Text, { TextVariant } from "./Text";
import VolumeUsage from "./VolumeUsage";
import BottomSheet from "./BottomSheet";
import Warning from "./Warning";
import { useRoute } from "@react-navigation/native";

interface Props {
  sub: PublicSubscriptionWithOfferDto;
  showOptions?: boolean;
  showDetails?: boolean;
}

const SubscriptionDetails: FC<Props> = ({ sub, showOptions, showDetails }) => {
  const { me } = useMe();
  const { meApi } = useApi();
  const { extra, refresh } = useSubscriptions(sub.id);
  const { showError } = useErrorSheet();
  const { showChat } = useSupport();
  const { push } = useRouter();
  const route = useRoute();

  const uncancelSub = useCallback(async () => {
    try {
      await meApi.meUncancelMySubscriptionV1({ subId: sub?.id });
      return true;
    } catch (err) {
      showError({
        error: err,
      });
      return false;
    }
  }, [meApi, sub.id]);

  const handleRenew = useCallback(async () => {
    try {
      const order = await meApi.meCreateMyOrderV1({
        createMyOrderDto: {
          type: OrderType.AddPlan,
          offerId: sub.offer.id,
        },
      });
      router.push(`/logged-in/orders/${order.id}/confirm`);
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, sub]);

  const futurePeriod = useMemo(
    () => extra?.periods?.find((p) => isFuture(p.startsAt)),
    [extra?.periods]
  );

  const showAddPackages = sub.status === SubscriptionStatus.Active;
  const showCancelNotice = sub.status === SubscriptionStatus.Cancelled;
  const showDeactivateNotice = sub.status === SubscriptionStatus.Deactivated;
  const showChangePlanNotice =
    futurePeriod && futurePeriod.offerId !== sub.offer.id;
  const simType =
    extra?.simDetails?.type ?? extra?.orders?.[0]?.simSelection?.simType;

  const showActivateESimNotice =
    sub.status === SubscriptionStatus.Active &&
    !extra?.simDetails?.isActivated &&
    simType === SimType.ESim;

  const showActivatePSimNotice =
    sub.status === SubscriptionStatus.Pending &&
    extra?.orders?.[0]?.currentStep?.type === "SIM" &&
    extra?.orders?.[0]?.currentStep?.error === "psim_missing_iccid" &&
    simType === SimType.PSim;

  useEffect(() => {
    const onBackPress = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandler.remove();
  }, []);

  return (
    <>
      <View
        style={{
          marginTop: Spacing.MEDIUM,
          backgroundColor: Color.PRIMARY,
          padding: Spacing.MEDIUM,
          gap: Spacing.MEDIUM,
          minHeight: 133,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text variant={TextVariant.H4} color={Color.BLACK}>
            {sub.label ?? `${me.firstName} ${me.lastName}`}
          </Text>

          {showOptions && (
            <Button
              compact="no-padding"
              type={ButtonType.TRANSPARENT}
              onPress={() =>
                router.navigate(`/logged-in/subscriptions/${sub.id}/settings`)
              }
            >
              <SvgGear color={Color.BLACK} />
            </Button>
          )}
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text color={Color.BLACK}>
              {formatPhoneNum(sub.phoneNumberMsisdn)}
            </Text>
            <Text color={Color.BLACK}>
              {sub.offer.plan.content.title ?? sub.offer.plan.name} Plan
            </Text>
          </View>

          <Text color={Color.BLACK}>{sub.status}</Text>
        </View>
      </View>

      {showDetails && (
        <>
          <View
            style={{
              backgroundColor: Color.DARK,
              padding: Spacing.MEDIUM,
            }}
          >
            {sub.offer.plan.content.summary?.type === "list" && (
              <View style={{ marginBottom: Spacing.MEDIUM }}>
                {sub.offer.plan.content.summary.items.map((item) => (
                  <Text
                    key={item}
                    variant={TextVariant.BodyMedium}
                    color={Color.WHITE}
                  >
                    {item}
                  </Text>
                ))}
              </View>
            )}

            <View style={{ gap: Spacing.MEDIUM }}>
              {extra?.usages
                ?.filter(
                  (u) =>
                    u.subscriptionId === sub.id &&
                    !u.isRoaming &&
                    !u.isUnlimited
                )
                .map((usage, i) => (
                  <VolumeUsage key={i} usage={usage} />
                ))}
            </View>

            {extra?.usages?.some(
              (u) => u.subscriptionId === sub.id && u.isRoaming
            ) && (
              <View style={{ gap: Spacing.MEDIUM, marginTop: Spacing.LARGE }}>
                <Text color={Color.WHITE}>Usage abroad</Text>
                {extra?.usages
                  ?.filter(
                    (u) =>
                      u.subscriptionId === sub.id &&
                      u.isRoaming &&
                      !u.isUnlimited
                  )
                  .map((usage, i) => (
                    <VolumeUsage key={i} usage={usage} />
                  ))}
              </View>
            )}

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: Spacing.LARGE,
              }}
            >
              <Text color={Color.WHITE}>Monthly Fee</Text>
              <Text color={Color.WHITE}>{formatCost(sub.offer.cost)}</Text>
            </View>

            {sub.currentPeriod?.endsAt && (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: Spacing.SMALL,
                }}
              >
                <Text color={Color.WHITE}>
                  {sub.status === SubscriptionStatus.Pending ||
                  sub.status === SubscriptionStatus.Active
                    ? "Renews"
                    : sub.status === SubscriptionStatus.Cancelled
                    ? "Ends"
                    : sub.status === SubscriptionStatus.Deactivated
                    ? "Deactivated"
                    : ""}
                </Text>
                <Text color={Color.WHITE}>
                  {format(sub.currentPeriod.endsAt, "MM/dd/yyyy")}
                </Text>
              </View>
            )}
          </View>

          {showChangePlanNotice && (
            <View
              style={{
                marginTop: Spacing.LARGE,
              }}
            >
              <Warning color={Color.WHITE} />
              <Text
                variant={TextVariant.H4}
                color={Color.WHITE}
                style={{
                  marginTop: Spacing.LARGE,
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                You have requested to change this plan.
              </Text>
              <Text
                variant={TextVariant.BodyLarge}
                color={Color.WHITE}
                style={{
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                Your new{" "}
                {futurePeriod?.offer.plan.content.title ??
                  futurePeriod?.offer.plan.name}{" "}
                plan will be active on{" "}
                {futurePeriod?.startsAt
                  ? format(futurePeriod.startsAt, "MM/dd/yyyy")
                  : "MM/dd/yyyy"}
              </Text>
            </View>
          )}

          {showDeactivateNotice && (
            <View
              style={{
                marginTop: Spacing.LARGE,
              }}
            >
              <Warning color={Color.WHITE} />
              <Text
                variant={TextVariant.H4}
                color={Color.WHITE}
                style={{
                  marginTop: Spacing.LARGE,
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                Your plan has been deactivated.
              </Text>
              <Text
                variant={TextVariant.BodyLarge}
                color={Color.WHITE}
                style={{
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                You can reactivate until{" "}
                {sub.currentPeriod?.endsAt
                  ? format(sub.currentPeriod.endsAt, "MM/dd/yyyy")
                  : "MM/dd/yyyy"}
                to keep your plan and phone number .
              </Text>

              <BottomSheet
                trigger={(show) => (
                  <Button
                    onPress={show}
                    type={ButtonType.PRIMARY}
                    style={{
                      marginTop: Spacing.SMALL,
                    }}
                  >
                    Reactivate
                  </Button>
                )}
              >
                {(close) => (
                  <>
                    <SvgInfoBlack
                      style={{
                        alignSelf: "center",
                        marginBottom: Spacing.MEDIUM,
                      }}
                    />
                    <View
                      style={{ alignItems: "flex-start", gap: Spacing.MEDIUM }}
                    >
                      <Text variant={TextVariant.H4} color={Color.BLACK}>
                        Important.
                      </Text>
                      <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                        By confirming the reactivation, your plan will be
                        restored with its original features, conditions, and
                        associated phone number. It will become active with
                        order confirmation and renew every 30 days.
                      </Text>
                    </View>
                    <Button
                      onPress={() => {
                        handleRenew();
                        close();
                      }}
                      type={ButtonType.PRIMARY}
                      style={{
                        marginVertical: Spacing.MEDIUM,
                        alignSelf: "stretch",
                      }}
                    >
                      Continue
                    </Button>
                  </>
                )}
              </BottomSheet>
            </View>
          )}

          {showCancelNotice && (
            <View
              style={{
                marginTop: Spacing.LARGE,
              }}
            >
              <Warning color={Color.WHITE} />
              <Text
                variant={TextVariant.H4}
                color={Color.WHITE}
                style={{
                  marginTop: Spacing.LARGE,
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                You have cancelled this plan.
              </Text>
              <Text
                variant={TextVariant.BodyLarge}
                color={Color.WHITE}
                style={{
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                It will be deactivated on{" "}
                {sub.currentPeriod?.endsAt
                  ? format(sub.currentPeriod.endsAt, "MM/dd/yyyy")
                  : "MM/dd/yyyy"}
                . You can undo the cancellation and keep your plan active, or
                you can change to a different plan that better suits your needs.
              </Text>
              <Button
                onPress={() =>
                  push(`/logged-in/subscriptions/${sub.id}/change-plan`)
                }
                type={ButtonType.TRANSPARENT}
                style={{
                  padding: Spacing.MEDIUM,
                  borderColor: Color.WHITE,
                  borderWidth: 1,
                }}
              >
                CHANGE PLAN
              </Button>

              <BottomSheet
                trigger={(show) => (
                  <Button
                    onPress={show}
                    type={ButtonType.PRIMARY}
                    style={{
                      marginTop: Spacing.SMALL,
                    }}
                  >
                    Keep Plan
                  </Button>
                )}
              >
                <SvgInfoBlack
                  style={{
                    alignSelf: "center",
                    marginBottom: Spacing.MEDIUM,
                  }}
                />
                <View style={{ alignItems: "flex-start", gap: Spacing.MEDIUM }}>
                  <Text variant={TextVariant.H4} color={Color.BLACK}>
                    Important.
                  </Text>
                  <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                    This plan has been cancelled, By pressing 'CONTINUE' below,
                    the cancellation will be undone, the current plan will
                    remain active and will renew on{" "}
                    {sub.currentPeriod?.startsAt
                      ? format(sub.currentPeriod.startsAt, "MM/dd/yyyy")
                      : "MM/dd/yyyy"}
                  </Text>
                </View>

                <BottomSheet
                  trigger={(show) => (
                    <Button
                      onPress={async () => {
                        if (await uncancelSub()) show();
                      }}
                      type={ButtonType.PRIMARY}
                      style={{
                        marginVertical: Spacing.MEDIUM,
                        alignSelf: "stretch",
                      }}
                    >
                      Continue
                    </Button>
                  )}
                  imageSuccess={true}
                >
                  <View
                    style={{
                      gap: Spacing.SMALL,
                      paddingVertical: Spacing.SMALL,
                      display: "flex",
                      justifyContent: "center",
                      width: "95%",
                    }}
                  >
                    <Text
                      variant={TextVariant.H4}
                      color={Color.BLACK}
                      style={{
                        flexWrap: "wrap",
                        flexShrink: 1,
                        marginBottom: Spacing.SMALL,
                      }}
                    >
                      Cancellation undone,
                    </Text>
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      The current plan will remain active and will renew on{" "}
                      {sub.currentPeriod?.startsAt
                        ? format(sub.currentPeriod.startsAt, "MM/dd/yyyy")
                        : "MM/dd/yyyy"}
                    </Text>

                    <Button
                      style={{
                        marginTop: Spacing.SMALL,
                        width: "100%",
                        alignSelf: "stretch",
                      }}
                      onPress={async () => {
                        await refresh();
                        close();
                      }}
                    >
                      OK
                    </Button>
                  </View>
                </BottomSheet>
              </BottomSheet>
            </View>
          )}

          {showActivatePSimNotice && (
            <View
              style={{
                marginTop: Spacing.LARGE,
              }}
            >
              <Warning color={Color.RED} />
              <Text
                variant={TextVariant.H4}
                color={Color.WHITE}
                style={{
                  marginTop: Spacing.LARGE,
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                Activate your SIM card now.
              </Text>
              <Text
                variant={TextVariant.BodyLarge}
                color={Color.WHITE}
                style={{
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                Your SIM card has been shipped. Once you receive it please scan
                the QR code on the back of the SIM card to activate it.
              </Text>
              <Button
                onPress={showChat}
                type={ButtonType.TRANSPARENT}
                style={{
                  padding: Spacing.MEDIUM,
                  borderColor: Color.WHITE,
                  borderWidth: 1,
                }}
              >
                Chat with us
              </Button>
              <Button
                onPress={() => {
                  router.push(
                    `/logged-in/subscriptions/${sub.id}/install/psim`
                  );
                }}
                type={ButtonType.PRIMARY}
                style={{
                  marginTop: Spacing.SMALL,
                }}
              >
                Scan QR
              </Button>
            </View>
          )}

          {showActivateESimNotice && (
            <View
              style={{
                marginTop: Spacing.LARGE,
              }}
            >
              <Warning color={Color.RED} />

              {simType === SimType.ESim ? (
                <>
                  <Text
                    variant={TextVariant.H4}
                    color={Color.WHITE}
                    style={{
                      marginTop: Spacing.LARGE,
                      marginBottom: Spacing.MEDIUM,
                    }}
                  >
                    Install your eSIM now.
                  </Text>
                  <Text
                    variant={TextVariant.BodyLarge}
                    color={Color.WHITE}
                    style={{
                      marginBottom: Spacing.MEDIUM,
                    }}
                  >
                    To start using your plan, install your eSIM by clicking
                    'INSTALL ESIM' below.
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    variant={TextVariant.H4}
                    color={Color.WHITE}
                    style={{
                      marginTop: Spacing.LARGE,
                      marginBottom: Spacing.MEDIUM,
                    }}
                  >
                    Please insert your p-sim.
                  </Text>
                </>
              )}

              <Button
                onPress={showChat}
                type={ButtonType.TRANSPARENT}
                style={{
                  padding: Spacing.MEDIUM,
                  borderColor: Color.WHITE,
                  borderWidth: 1,
                }}
              >
                Chat with us
              </Button>
              <Button
                onPress={() => {
                  router.push(
                    `/logged-in/subscriptions/${sub.id}/install/esim`
                  );
                }}
                type={ButtonType.PRIMARY}
                style={{
                  marginTop: Spacing.SMALL,
                }}
              >
                Install SIM
              </Button>
            </View>
          )}

          {extra?.children && extra.children.length > 0 && (
            <View style={{ marginTop: Spacing.LARGE }}>
              <Text color={Color.WHITE} style={{ marginBottom: Spacing.SMALL }}>
                Active packages
              </Text>

              {extra?.children?.map((childSub) => (
                <Fragment key={childSub.id}>
                  <View
                    style={{
                      backgroundColor: Color.PRIMARY,
                      padding: Spacing.MEDIUM,
                      gap: Spacing.MEDIUM,
                    }}
                  >
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text variant={TextVariant.H4} color={Color.BLACK}>
                        {childSub.offer.plan.content.tags?.includes("data")
                          ? "Data booster"
                          : childSub.offer.plan.content.tags?.includes(
                              "international"
                            )
                          ? "Int. credit"
                          : childSub.offer.plan.content.tags?.includes(
                              "roaming"
                            )
                          ? "Roaming pass"
                          : "Package"}
                      </Text>

                      <Text variant={TextVariant.H4} color={Color.BLACK}>
                        {childSub.offer.plan.content.title ??
                          childSub.offer.plan.name}
                      </Text>
                    </View>

                    {childSub.currentPeriod?.endsAt && (
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text color={Color.BLACK}>Valid until</Text>
                        <Text color={Color.BLACK}>
                          {format(childSub.currentPeriod.endsAt, "MM/dd/yyyy")}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={{
                      backgroundColor: Color.DARK,
                      padding: Spacing.MEDIUM,
                      marginBottom: Spacing.MEDIUM,
                    }}
                  >
                    <View style={{ gap: Spacing.MEDIUM }}>
                      {extra?.usages
                        ?.filter(
                          (u) =>
                            u.subscriptionId === childSub.id &&
                            !u.isRoaming &&
                            !u.isUnlimited
                        )
                        .map((usage, i) => (
                          <VolumeUsage key={i} usage={usage} />
                        ))}
                    </View>

                    {extra?.usages?.some(
                      (u) => u.subscriptionId === childSub.id && u.isRoaming
                    ) && (
                      <View
                        style={{
                          gap: Spacing.MEDIUM,
                          marginTop: Spacing.LARGE,
                        }}
                      >
                        <Text color={Color.WHITE}>Usage abroad</Text>
                        {extra?.usages
                          ?.filter(
                            (u) =>
                              u.subscriptionId === childSub.id &&
                              u.isRoaming &&
                              !u.isUnlimited
                          )
                          .map((usage, i) => (
                            <VolumeUsage key={i} usage={usage} />
                          ))}
                      </View>
                    )}
                  </View>
                </Fragment>
              ))}
            </View>
          )}

          {showAddPackages && (
            <View style={{ marginTop: Spacing.MEDIUM, gap: Spacing.SMALL }}>
              <Text color={Color.WHITE}>Add a package</Text>

              <MenuItemLink
                href={{
                  pathname: `/logged-in/subscriptions/[subId]/packages`,
                  params: { subId: sub.id, type: "data" },
                }}
              >
                Data
              </MenuItemLink>

              <MenuItemLink
                href={{
                  pathname: `/logged-in/subscriptions/[subId]/packages`,
                  params: { subId: sub.id, type: "roaming" },
                }}
              >
                Roaming
              </MenuItemLink>

              <MenuItemLink
                href={{
                  pathname: `/logged-in/subscriptions/[subId]/packages`,
                  params: { subId: sub.id, type: "international" },
                }}
              >
                International
              </MenuItemLink>
            </View>
          )}
        </>
      )}
    </>
  );
};

export default SubscriptionDetails;
