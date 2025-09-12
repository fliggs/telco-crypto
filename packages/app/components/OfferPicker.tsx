import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Dimensions, Platform, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import Decimal from "decimal.js";
import {
  OrderType,
  PublicCountryDto,
  PublicOfferWithPlanWithVolumesDto,
  VolumeType,
} from "api-client-ts";

import { get, set } from "@/storage";
import { formatCost, getValidUntilDate } from "@/util";
import { Color, Spacing } from "@/constants";
import { useApi } from "@/providers/ApiProvider";
import { useSubscriptions } from "@/providers/SubscriptionsProvider";

import Text, { TextVariant } from "./Text";
import BottomSheet from "./BottomSheet";
import AccordionBlock from "./AccordionBlock";
import SelectableCard, { CardVariant } from "./SelectableCard";
import PriceTag from "./PriceTag";
import OfferItem from "./OfferItem";

interface Props extends PropsWithChildren {
  offers: PublicOfferWithPlanWithVolumesDto[];
  offer?: PublicOfferWithPlanWithVolumesDto | undefined | null;
  type?: string;
  packageType?: string;
  onChange: (plan: PublicOfferWithPlanWithVolumesDto) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function OfferPicker({
  offers,
  offer,
  type,
  packageType,
  onChange,
  isRefreshing,
  onRefresh,
  children,
}: Props) {
  const selOffer = useMemo(() => offer ?? offers[0], [offer]);
  const { settingsApi } = useApi();
  const { extra, refresh } = useSubscriptions(selOffer.id);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [startNow, setStartNow] = useState<boolean>(false);

  const [promo, setPromo] = useState("");
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const { width } = Dimensions.get("window");
  const [countries, setCountries] = useState<PublicCountryDto[]>([]);

  const handleChange = (txt: string) => {
    setPromo(txt);

    if (txt.length < 5) {
      setMessage({
        type: "error",
        text: "The promo code is incorrect or incomplete.",
      });
    } else {
      setMessage({ type: "success", text: "Promo code successfully applied." });
    }
  };

  useEffect(() => {
    if (offers.length > 0 && !offer) {
      onChange(offers[0]);
    }
  }, [offers, offer]);

  const fetchCountries = async () => {
    try {
      const cached = get<{ timestamp: number; data: PublicCountryDto[] }>(
        "cached_countries"
      );

      if (cached && Date.now() - cached.timestamp < 86400000) {
        setCountries(cached.data);
      } else {
        const data = await settingsApi.settingsGetSupportedCountriesV1();
        setCountries(data);
        set("cached_countries", { timestamp: Date.now(), data });
      }
    } catch (e) {
      console.error("Failed to fetch devices:", e);
    }
  };

  const creditUsage = extra?.usages?.find((u) => u.type === VolumeType.Credit);

  const currentBalance = creditUsage
    ? Number(creditUsage.amountTotal) - Number(creditUsage.amountUsed)
    : 0;

  const topUp =
    offer?.plan.volumes
      .reduce(
        (total, vol) =>
          vol.type === VolumeType.Credit ? total.add(vol.amount) : total,
        new Decimal(0)
      )
      .toNumber() ?? 0;

  const topUpBonus = 0;
  const newBalance = Number(currentBalance) + Number(topUp);

  return (
    <ScrollView
      contentContainerStyle={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing ?? false}
            onRefresh={onRefresh}
            tintColor={Color.WHITE}
          />
        ) : undefined
      }
    >
      {children}

      <View
        style={{
          marginTop: Spacing.SMALL,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: Spacing.SMALL,
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {offers.map((offer, index) => (
          <OfferItem
            key={offer.id}
            offer={offer}
            index={index}
            width={width}
            selOffer={selOffer}
            offers={offers}
            onChange={onChange}
          />
        ))}
      </View>

      {selOffer && (
        <View
          style={{
            marginTop: Spacing.MEDIUM,
            backgroundColor: Color.DARK,
            padding: Spacing.MEDIUM,
          }}
        >
          {selOffer.originalCost && selOffer.originalCost !== selOffer.cost && (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                position: "relative",
                marginBottom: Spacing.SMALL,
              }}
            >
              <Text
                variant={TextVariant.Description}
                color={Color.WHITE}
                style={{
                  position: "absolute",
                  left: -5,
                  bottom: Platform.OS == "ios" ? 10 : 5,
                }}
              >
                $
              </Text>
              <Text variant={TextVariant.H4} color={Color.WHITE}>
                {selOffer.originalCost.substring(
                  0,
                  selOffer.originalCost.indexOf(".")
                )}
              </Text>

              <View style={{ position: "relative" }}>
                <Text variant={TextVariant.H4} color={Color.WHITE}>
                  {selOffer.originalCost.substring(
                    selOffer.originalCost.indexOf(".")
                  )}
                </Text>
                <View
                  style={{
                    position: "absolute",
                    height: Platform.OS == "ios" ? "160%" : "150%",
                    width: 3,
                    backgroundColor: Color.PRIMARY,
                    transform:
                      Platform.OS == "ios"
                        ? "translate(18px, -13px) rotate(70deg)"
                        : "translate(18px, -5px) rotate(70deg)",
                  }}
                ></View>
              </View>
              {type == OrderType.AddPlan && (
                <Text
                  variant={TextVariant.Description}
                  color={Color.WHITE}
                  style={{
                    position: "absolute",
                    left: 50,
                    bottom: Platform.OS == "ios" ? 10 : 5,
                  }}
                >
                  /mo
                </Text>
              )}
              <View />
            </View>
          )}

          <PriceTag
            value={selOffer?.cost ?? "0.00"}
            suffix={type == OrderType.AddPlan ? "/mo" : undefined}
            color={Color.PRIMARY}
          />

          {selOffer.content.summary?.type === "list" &&
            selOffer.content.summary.items.map((item) => (
              <View
                key={item}
                style={{ borderBottomColor: Color.WHITE, borderBottomWidth: 1 }}
              >
                <Text
                  variant={TextVariant.BodySmall}
                  color={Color.WHITE}
                  style={{
                    paddingTop: Spacing.SMALL,
                    paddingBottom: Spacing.SMALL,
                  }}
                >
                  {item}
                </Text>
              </View>
            ))}

          {selOffer.plan.content.summary?.type === "list" &&
            selOffer.plan.content.summary.items.map((item) => (
              <View
                key={item}
                style={{ borderBottomColor: Color.WHITE, borderBottomWidth: 1 }}
              >
                <Text
                  variant={TextVariant.BodySmall}
                  color={Color.WHITE}
                  style={{
                    paddingTop: Spacing.SMALL,
                    paddingBottom: Spacing.SMALL,
                  }}
                >
                  {item}
                </Text>
              </View>
            ))}

          {packageType == "international" ? (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  Current balance
                </Text>
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  ${currentBalance}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingBottom: Spacing.SMALL,
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.PRIMARY}>
                  Top-up
                </Text>
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  ${topUp}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: Spacing.SMALL,
                  borderBottomWidth: 1,
                  borderBottomColor: Color.WHITE,
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  Top-up bonus
                </Text>
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  ${topUpBonus}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: Spacing.SMALL,
                }}
              >
                <Text variant={TextVariant.Description} color={Color.WHITE}>
                  New balance after top-up
                </Text>
                <Text variant={TextVariant.Description} color={Color.WHITE}>
                  ${newBalance}
                </Text>
              </View>
            </View>
          ) : packageType === "data" ? (
            <Text
              variant={TextVariant.BodySmall}
              color={Color.WHITE}
              style={{ marginVertical: Spacing.SMALL }}
            >
              Valid until {getValidUntilDate(selOffer.plan.validForSeconds)}
            </Text>
          ) : null}

          {type == OrderType.AddPlan && (
            <BottomSheet
              trigger={(show) => (
                <Text
                  variant={TextVariant.Description}
                  style={{
                    marginTop: Spacing.MEDIUM,
                  }}
                  onPress={show}
                >
                  Plan details {"> "}
                </Text>
              )}
            >
              <Text variant={TextVariant.H3} color={Color.BLACK}>
                {`${selOffer?.plan?.content?.title} Plan`}
              </Text>

              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {selOffer.plan.content.details?.map((item, index) =>
                  item.type === "list" || item.type === "text" ? (
                    <AccordionBlock
                      key={index}
                      data={{
                        title: item.title ?? "",
                        description:
                          item.type === "list"
                            ? item.items.join("\n")
                            : item.text,
                      }}
                      show={openIndex === index}
                      onShow={() => setOpenIndex(index)}
                      onClose={() => setOpenIndex(null)}
                      variant={Color.BLACK}
                    />
                  ) : null
                )}
              </View>
            </BottomSheet>
          )}

          {packageType && packageType == "roaming" && (
            <BottomSheet
              trigger={(show) => (
                <Text
                  variant={TextVariant.Description}
                  style={{
                    marginTop: Spacing.MEDIUM,
                  }}
                  onPress={() => {
                    show();
                    fetchCountries();
                  }}
                >
                  Countries {"> "}
                </Text>
              )}
            >
              <Text
                variant={TextVariant.H3}
                color={Color.BLACK}
                style={{ alignSelf: "flex-start" }}
              >
                Countries.
              </Text>
              <Text
                variant={TextVariant.Description}
                color={Color.BLACK}
                style={{ alignSelf: "flex-start" }}
              >
                Enjoy roaming in +215 countries.
              </Text>

              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: Spacing.SMALL,
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                {countries
                  ?.filter((item: any) => item.roaming)
                  .map((item) => (
                    <Text
                      key={item.name}
                      variant={TextVariant.BodySmall}
                      color={Color.BLACK}
                    >
                      {item.name}
                    </Text>
                  ))}

                <View style={{ borderBottomWidth: 1 }}></View>

                {countries
                  ?.filter((item: any) => !item.roaming)
                  .map((item) => (
                    <Text
                      key={item.name}
                      variant={TextVariant.BodySmall}
                      color={Color.BLACK}
                    >
                      {item.name}
                    </Text>
                  ))}
              </View>
            </BottomSheet>
          )}
        </View>
      )}

      {type == OrderType.AddPlan && (
        <View style={{ marginVertical: Spacing.MEDIUM }}>
          {message && (
            <Text
              variant={TextVariant.BodySmall}
              style={{
                marginTop: 8,
                fontSize: 14,
                color: message.type === "error" ? Color.RED : Color.PETROL,
              }}
            >
              {message.text}
            </Text>
          )}
        </View>
      )}

      {packageType == "international" ? (
        <>
          <BottomSheet
            trigger={(show) => (
              <Text
                variant={TextVariant.Description}
                style={{
                  marginTop: Spacing.LARGE,
                }}
                onPress={() => {
                  show();
                  fetchCountries();
                }}
              >
                Rates {"> "}
              </Text>
            )}
          >
            <View style={{ width: "95%" }}>
              <Text
                variant={TextVariant.H3}
                color={Color.BLACK}
                style={{ alignSelf: "flex-start" }}
              >
                Rates.
              </Text>
              <Text
                variant={TextVariant.Description}
                color={Color.BLACK}
                style={{ alignSelf: "flex-start" }}
              >
                Rates per minute for calls from the US to other country.
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: "95%",
                gap: Spacing.SMALL,
                marginBottom: Spacing.SMALL,
                backgroundColor: "#F8F8F8",
                marginHorizontal: Spacing.MEDIUM,
              }}
            >
              {countries
                ?.filter((item) => item.roaming && item.favourite)
                .map((item) => (
                  <View
                    key={item.name}
                    style={{
                      justifyContent: "space-between",
                      flexDirection: "row",
                    }}
                  >
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      {item.name}
                    </Text>
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      {formatCost(item.rate)}
                    </Text>
                  </View>
                ))}
              <View style={{ borderBottomWidth: 1 }}></View>
              {countries
                ?.filter((item) => item.roaming && !item.favourite)
                .map((item) => (
                  <View
                    key={item.name}
                    style={{
                      justifyContent: "space-between",
                      flexDirection: "row",
                    }}
                  >
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      {item.name}
                    </Text>
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      {formatCost(item.rate)}
                    </Text>
                  </View>
                ))}
            </View>
            <Text
              variant={TextVariant.Description}
              color={Color.BLACK}
              style={{ alignSelf: "flex-start", marginBottom: Spacing.MEDIUM }}
            >
              Landline or mobile, we make no difference. All SMS $0.10.
            </Text>
          </BottomSheet>
          <Text
            variant={TextVariant.BodySmall}
            color={Color.WHITE}
            style={{ marginTop: Spacing.MEDIUM }}
          >
            Stay in touch with friends and family around the world. Connect with
            +215 countries.
          </Text>
        </>
      ) : packageType == "roaming" ? (
        <View style={{ marginTop: Spacing.SMALL }}>
          <SelectableCard
            title="Start now."
            variant={CardVariant.SECONDARY}
            selected={startNow == true}
            onPress={() => setStartNow(true)}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}
